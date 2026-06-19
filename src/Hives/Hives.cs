using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using BepInEx;
using BepInEx.Configuration;
using BepInEx.Logging;
using Controllers;
using Gameplay.Buildings;
using Gameplay.Rebuilding;
using Gameplay.Units.Enemy.Hideouts;
using HarmonyLib;
using UnityEngine;

// Hives 0.1.2
// Seeds infected hives once per new game (saved with the game).
// 0.1.2 fix: spawn a VARIETY of infected nests instead of always the first infected
// HideoutDraft (which was the dog nest -> every hive was dogs). Now collects ALL
// Fraction==Infected drafts and picks one at random per hive.
namespace Hives
{
    [BepInPlugin("com.ifzmod.hives", "Hives", "0.1.2")]
    public class Plugin : BaseUnityPlugin
    {
        public static ManualLogSource Log;
        public static ConfigEntry<bool> Enabled;
        public static ConfigEntry<int> HiveCount;
        public static ConfigEntry<float> MinDist;
        public static ConfigEntry<float> MaxDist;
        public static ConfigEntry<float> MinSpacing;
        public static ConfigEntry<float> MinVolume;
        public static ConfigEntry<int> PerTick;
        public static ConfigEntry<bool> Verbose;

        private void Awake()
        {
            Log = Logger;
            Enabled = Config.Bind("General", "Enabled", true, "Master toggle.");
            HiveCount = Config.Bind("General", "HiveCount", 12,
                "How many infected hives to seed across the map. Each hive spawns a real infected group, so high counts flood the map. 8-15 is a sane siege.\nIMPORTANT: hives are placed ONCE, at the start of a new game, and are saved WITH that game. Changing this does NOT affect an already-seeded save. To re-tune: start a NEW game, or load a pre-Hives save, set the value, then play.");
            MinDist = Config.Bind("General", "MinDistanceFromHQ", 80f,
                "Hives won't spawn within this distance of your HQ. Applied at seed time.");
            MaxDist = Config.Bind("General", "MaxDistanceFromHQ", 0f,
                "If > 0, hives only spawn within this distance of HQ. 0 = whole map.");
            MinSpacing = Config.Bind("General", "MinSpacingBetweenHives", 120f,
                "Minimum distance between two seeded hives. Stops them clumping. 0 = no spacing.");
            MinVolume = Config.Bind("General", "MinBuildingVolume", 2000f,
                "A building must be at least this big (volume) to host a hive. Hives go in the LARGEST qualifying buildings first.");
            PerTick = Config.Bind("Tuning", "PlacePerTick", 5,
                "Hives placed per tick while seeding — spreads the spawn over a few frames.");
            Verbose = Config.Bind("Debug", "Verbose", false, "Log seeding details to Player.log.");

            new Harmony("com.ifzmod.hives").PatchAll();
            var go = new GameObject("Hives_Driver");
            UnityEngine.Object.DontDestroyOnLoad(go);
            go.AddComponent<HivesDriver>();
            Logger.LogInfo("Hives 0.1.2 loaded — infected hive seeding (once per new game)");
        }
    }

    // Capture the HideoutsController instance when it is constructed.
    [HarmonyPatch]
    internal static class HideoutsControllerCapture
    {
        public static HideoutsController Instance;
        private static MethodBase TargetMethod() => typeof(HideoutsController).GetConstructors()[0];
        private static void Postfix(HideoutsController __instance) => Instance = __instance;
    }

    public class HivesDriver : MonoBehaviour
    {
        private float _t;
        private bool _done;
        private bool _seeding;
        private string _flag;
        private List<HideoutDraft> _drafts;   // 0.1.2: all infected drafts, not a single one
        private List<Building> _cands;
        private List<Vector3> _placedPos;
        private Vector3 _hqPos;
        private int _placed;
        private int _want;

        private void Update()
        {
            if (_done) return;
            _t += Time.deltaTime;
            if (_t < 1f && !_seeding) return;
            _t = 0f;
            try { Step(); }
            catch (Exception ex) { if (Plugin.Verbose.Value) Debug.Log("[Hives] " + ex.Message); }
        }

        private void Step()
        {
            if (!Plugin.Enabled.Value) return;
            if (_seeding) { PlaceBatch(); return; }

            string key = SaveKey();
            if (key == null) return;
            _flag = "ifz_hives_seeded_" + key;
            if (PlayerPrefs.GetInt(_flag, 0) == 1) { _done = true; return; }

            HideoutsController instance = HideoutsControllerCapture.Instance;
            Structure hq = HqController.MainHeadquarter;
            BuildingsController buildings = IFZModAPI.Cache.Buildings;
            if (instance == null || hq == null || buildings?.Buildings == null || buildings.Buildings.Count == 0)
                return;

            HideoutsConfig cfg = instance.HideoutsConfig;
            _drafts = cfg?.HideoutDrafts?
                .Where(x => x != null && (int)x.Fraction == 1) // 1 == Fraction.Infected
                .ToList();
            if (_drafts == null || _drafts.Count == 0)
            {
                Plugin.Log.LogWarning("[Hives] no infected HideoutDraft found — skipping (flagged so it won't retry)");
                PlayerPrefs.SetInt(_flag, 1);
                _done = true;
                return;
            }
            if (Plugin.Verbose.Value)
                Plugin.Log.LogInfo($"[Hives] {_drafts.Count} infected draft(s): " +
                    string.Join(", ", _drafts.Select(d => d.name)));

            _hqPos = hq.Position;
            float minDist = Plugin.MinDist.Value;
            float maxDist = Plugin.MaxDist.Value;
            float minVol = Mathf.Max(0f, Plugin.MinVolume.Value);

            var adapted = new HashSet<Building>(buildings.AdaptedBuildings ?? (System.Collections.Generic.IReadOnlyList<Building>)new Building[0]);
            _cands = new List<Building>();
            foreach (Building b in buildings.Buildings)
            {
                if (b == null || adapted.Contains(b) || b.Volume < minVol) continue;
                float d = Vector3.Distance(b.Position, _hqPos);
                if (d < minDist) continue;
                if (maxDist > 0f && d > maxDist) continue;
                _cands.Add(b);
            }
            _cands.Sort((a, b) => a.Volume.CompareTo(b.Volume)); // largest popped from the end

            _want = Plugin.HiveCount.Value;
            _placed = 0;
            _placedPos = new List<Vector3>();
            _seeding = true;
            if (Plugin.Verbose.Value)
                Debug.Log($"[Hives] seeding up to {_want} from {_cands.Count} candidates");
        }

        private void PlaceBatch()
        {
            HideoutsController instance = HideoutsControllerCapture.Instance;
            int perTick = Mathf.Max(1, Plugin.PerTick.Value);
            float spacing = Mathf.Max(0f, Plugin.MinSpacing.Value);
            float spacingSqr = spacing * spacing;
            int placedThisTick = 0;
            int tries = 0;
            int maxTries = Mathf.Max(perTick * 50, 200);

            while (_placed < _want && _cands.Count > 0 && placedThisTick < perTick && tries < maxTries)
            {
                tries++;
                Building b = _cands[_cands.Count - 1];
                _cands.RemoveAt(_cands.Count - 1);

                if (spacingSqr > 0f)
                {
                    Vector3 pos = b.Position;
                    bool tooClose = false;
                    for (int i = 0; i < _placedPos.Count; i++)
                    {
                        if ((_placedPos[i] - pos).sqrMagnitude < spacingSqr) { tooClose = true; break; }
                    }
                    if (tooClose) continue;
                }

                // 0.1.2: pick a random infected draft per hive -> variety, not all dogs.
                HideoutDraft draft = _drafts[UnityEngine.Random.Range(0, _drafts.Count)];

                Hideout hideout = null;
                try { hideout = instance != null ? instance.TryInstantiateHideout(draft, b) : null; }
                catch (Exception ex) { if (Plugin.Verbose.Value) Debug.Log("[Hives] place: " + ex.Message); }

                if (hideout != null)
                {
                    _placed++;
                    placedThisTick++;
                    _placedPos.Add(b.Position);
                    if (Plugin.Verbose.Value)
                        Debug.Log($"[Hives] #{_placed} placed: building {b.ID} vol={b.Volume:F0} " +
                                  $"draft={draft.name} dist={Vector3.Distance(b.Position, _hqPos):F0}m");
                }
            }

            if (_placed >= _want || _cands.Count == 0)
            {
                PlayerPrefs.SetInt(_flag, 1);
                _seeding = false;
                _done = true;
                Plugin.Log.LogInfo($"[Hives] seeded {_placed}/{_want} infected hives");
            }
        }

        private static string SaveKey()
        {
            try
            {
                SaveInfo info = SaveHandler.SaveInfo;
                if (info == null) return null;
                return info.Name + "_" + info.DateTime.Ticks;
            }
            catch { return null; }
        }
    }
}

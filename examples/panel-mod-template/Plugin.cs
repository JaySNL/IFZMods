using BepInEx;
using IFZModPanels;
using UnityEngine;

// IFZModPanels starter. Copy this folder, rename it + the .csproj, then change the
// GUID/name/version below and the Register id. See docs/IFZModPanels-API.md for the full API.
namespace PanelMod
{
    [BepInPlugin(Guid, "Panel Mod", "0.1.0")]
    [BepInDependency("ifz.modpanels")]        // load after the panels library
    public sealed class Plugin : BaseUnityPlugin
    {
        public const string Guid = "ifz.panelmod";

        private void Awake()
        {
            // Register ONCE. The builder re-runs on every "Game" scene load (reload-safe).
            // Capture handles in locals here, then mutate them from w.Every(...).
            Panels.Register(Guid + ".main", ctx =>
            {
                var w = ctx.Window("Panel Mod", SizeMode.AutoHeight(300, 360), toggleKey: KeyCode.F7);

                w.Section("Example");
                var count = w.Value("Ticks", "0");   // label left, value right
                var bar   = w.Bar("Progress", 0f);

                int n = 0;
                w.Every(1f, () =>                     // fires once per second (even while paused)
                {
                    n++;
                    count.Set(n);
                    bar.Set((n % 10) / 10f);
                });

                w.Button("Reset", () => { n = 0; count.Set(0); bar.Set(0f); });
            });

            Logger.LogInfo("Panel Mod loaded (F7 to toggle).");
        }
    }
}

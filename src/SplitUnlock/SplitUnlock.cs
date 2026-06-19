using BepInEx;
using BepInEx.Configuration;
using BepInEx.Logging;
using Gameplay.Rebuilding.CustomBuildings;
using Gameplay.Rebuilding.Split;
using HarmonyLib;

// SplitUnlock 1.2.0
// - Bypass "too narrow / too complex" and "too small" split denials.
// - Override custom (draw-your-own) building min/max surface.
// - NEW: AllowShortWalls — bypass the "at least one of the walls is too short" rejection.
namespace SplitUnlock
{
    [BepInPlugin("com.ifzmod.splitunlock", "Split Unlock", "1.2.0")]
    public class Plugin : BaseUnityPlugin
    {
        public static ManualLogSource Log;
        public static ConfigEntry<bool> Enabled;
        public static ConfigEntry<bool> AllowWrongDimensions;
        public static ConfigEntry<bool> AllowSmallSurface;
        public static ConfigEntry<bool> OverrideBuildingSize;
        public static ConfigEntry<float> MaxBuildingSurface;
        public static ConfigEntry<float> MinBuildingSurface;
        public static ConfigEntry<bool> AllowShortWalls;
        public static ConfigEntry<bool> Verbose;

        private void Awake()
        {
            Log = Logger;
            Enabled = Config.Bind("General", "Enabled", true,
                "Master toggle for the SPLIT bypass. Off = vanilla split validator. Does not affect the building-size / wall options below.");
            AllowWrongDimensions = Config.Bind("General", "AllowWrongDimensions", true,
                "Allow splits the game rejects as 'too narrow or too complex'. On = bypass.");
            AllowSmallSurface = Config.Bind("General", "AllowSmallSurface", true,
                "Allow splits the game rejects as 'too small'. On = bypass MinSplitSurface * 3 check.");
            OverrideBuildingSize = Config.Bind("BuildingSize", "OverrideBuildingSize", true,
                "Override custom (draw-your-own) building size limits with the values below. Off = vanilla (max 1000, min 5).");
            MaxBuildingSurface = Config.Bind("BuildingSize", "MaxBuildingSurface", 1000f,
                "Largest custom building you can draw, in m². Vanilla = 1000.");
            MinBuildingSurface = Config.Bind("BuildingSize", "MinBuildingSurface", 5f,
                "Smallest custom building you can draw, in m². Vanilla = 5.");
            AllowShortWalls = Config.Bind("BuildingSize", "AllowShortWalls", true,
                "Allow custom buildings with walls shorter than the game minimum (MinWallLength). " +
                "On = bypass the 'at least one of the walls is too short' rejection.");
            Verbose = Config.Bind("Debug", "Verbose", false, "Log each bypassed denial.");

            new Harmony("com.ifzmod.splitunlock").PatchAll();
            Logger.LogInfo("SplitUnlock 1.2.0 loaded - split bypass + size override + short-wall bypass");
        }
    }

    // Split: bypass WrongDimensions (6) and SmallSurface (5).
    [HarmonyPatch(typeof(BuildingSplitHandler), "CheckWrongDimensions")]
    internal static class CheckWrongDimensionsPatch
    {
        private static void Postfix(ref bool __result, ref SplitFailReason splitFailReason)
        {
            if (Plugin.Enabled.Value && __result &&
                ((splitFailReason == SplitFailReason.WrongDimensions && Plugin.AllowWrongDimensions.Value) ||
                 (splitFailReason == SplitFailReason.SmallSurface && Plugin.AllowSmallSurface.Value)))
            {
                if (Plugin.Verbose.Value)
                    Plugin.Log.LogInfo($"[SplitUnlock] bypassed split denial: {splitFailReason}");
                splitFailReason = SplitFailReason.None;
                __result = false;
            }
        }
    }

    // Custom building: max surface override.
    [HarmonyPatch(typeof(CustomBuildingData), "IsBelowMaximalAreaSize")]
    internal static class MaxAreaPatch
    {
        private static void Postfix(CustomBuildingData __instance, ref bool __result)
        {
            if (Plugin.OverrideBuildingSize.Value)
                __result = __instance.Surface < Plugin.MaxBuildingSurface.Value;
        }
    }

    // Custom building: min surface override.
    [HarmonyPatch(typeof(CustomBuildingData), "HasMinimalAreaSize")]
    internal static class MinAreaPatch
    {
        private static void Postfix(CustomBuildingData __instance, ref bool __result)
        {
            if (Plugin.OverrideBuildingSize.Value)
                __result = __instance.Surface > Plugin.MinBuildingSurface.Value;
        }
    }

    // NEW: custom building wall-length bypass ("at least one of the walls is too short").
    [HarmonyPatch(typeof(CustomBuildingData), "WallsHasMinimalLenght")]
    internal static class WallLengthPatch
    {
        private static void Postfix(ref bool __result)
        {
            if (Plugin.AllowShortWalls.Value)
            {
                if (Plugin.Verbose.Value && !__result)
                    Plugin.Log.LogInfo("[SplitUnlock] bypassed wall-too-short");
                __result = true;
            }
        }
    }
}

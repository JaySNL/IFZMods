using System;
using System.Collections;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using BepInEx;
using BepInEx.Logging;
using HarmonyLib;

// IFZ macOS/CrossOver fix — activates ONLY on macOS-Wine, inert on Windows and Linux.
//
// macOS-Wine / Unity-Mono filesystem bugs that break the game:
//   (1) File.Delete of a missing file throws IOException("Success")  -> new-game crash.
//   (2) File.Exists FALSE-POSITIVE -> save loader reads the absent ".json" instead of the
//       present ".bytes" (CacheParameters.FileExists returns true wrongly).
//   (3) ZipFile.ExtractToDirectory produces no files -> compressed saves won't unpack
//       (ZipFile.CreateFromDirectory / saving works fine).
//
// Gating: run under Wine (ntdll!wine_get_version exists) AND on macOS (Z:\System\Library
// present, which maps to the mac root only under CrossOver). Windows = not Wine -> inert.
// Linux = Wine but no mac marker -> inert.
namespace IFZMacFix
{
    [BepInPlugin("ifz.macfix", "IFZ Mac File Fix", "1.5.0")]
    public class Plugin : BaseUnityPlugin
    {
        internal static ManualLogSource Log;

        [DllImport("ntdll.dll", EntryPoint = "wine_get_version")]
        private static extern IntPtr wine_get_version();

        private static bool IsWine()
        {
            try { wine_get_version(); return true; }
            catch { return false; }
        }

        private static bool IsMacWine()
        {
            if (!IsWine()) return false;
            try { return Directory.Exists(@"Z:\System\Library\CoreServices") || Directory.Exists(@"Z:\System\Library"); }
            catch { return false; }
        }

        private void Awake()
        {
            Log = Logger;
            if (!IsMacWine())
            {
                Logger.LogInfo("Not macOS/Wine — IFZ Mac File Fix inert (vanilla behaviour).");
                return;
            }
            Logger.LogWarning("macOS/Wine detected — activating filesystem fixes.");

            var h = new Harmony("ifz.macfix");

            PatchFinalizer(h, typeof(File), "Delete", new[] { typeof(string) });
            PatchFinalizer(h, typeof(File), "Move", new[] { typeof(string), typeof(string) });
            PatchFinalizer(h, typeof(Directory), "Delete", new[] { typeof(string) });
            PatchFinalizer(h, typeof(Directory), "Delete", new[] { typeof(string), typeof(bool) });

            TryPatch(h, "MapOperator.Runtime.Configs.Parameters.CacheParameters", "FileExists",
                new[] { typeof(string) }, nameof(FileExistsPrefix));

            try
            {
                var sh = AccessTools.TypeByName("SaveHandler");
                if (sh != null)
                {
                    RuntimeHelpers.RunClassConstructor(sh.TypeHandle);
                    var f = AccessTools.Field(sh, "DataCompressionEnabled");
                    if (f != null) { f.SetValue(null, false); Logger.LogInfo("DataCompressionEnabled -> false"); }
                }
            }
            catch (Exception e) { Logger.LogError("disable-compression failed: " + e); }

            TryPatch(h, "SaveValidator", "CheckIfCompressed", Type.EmptyTypes, nameof(CheckIfCompressedPrefix));

            Logger.LogInfo("IFZ Mac File Fix 1.5.0 active");
        }

        private void TryPatch(Harmony h, string typeName, string method, Type[] args, string handler)
        {
            try
            {
                var t = AccessTools.TypeByName(typeName);
                var m = t == null ? null : AccessTools.Method(t, method, args.Length == 0 ? null : args);
                if (m == null) { Logger.LogWarning("not found: " + typeName + "." + method); return; }
                h.Patch(m, prefix: new HarmonyMethod(typeof(Plugin).GetMethod(handler, BindingFlags.Static | BindingFlags.Public)));
                Logger.LogInfo("Patched " + typeName + "." + method);
            }
            catch (Exception e) { Logger.LogError("patch failed " + typeName + "." + method + ": " + e); }
        }

        private void PatchFinalizer(Harmony h, Type type, string name, Type[] args)
        {
            try
            {
                var m = AccessTools.Method(type, name, args);
                if (m != null)
                    h.Patch(m, finalizer: new HarmonyMethod(
                        typeof(Plugin).GetMethod(nameof(Swallow), BindingFlags.Static | BindingFlags.Public)));
            }
            catch (Exception e) { Logger.LogWarning("patch skipped " + type.Name + "." + name + ": " + e.Message); }
        }

        public static void CheckIfCompressedPrefix(object __instance)
        {
            try
            {
                var f = AccessTools.Field(__instance.GetType(), "_pathToLoad");
                string path = f?.GetValue(__instance) as string;
                if (string.IsNullOrEmpty(path)) return;
                string zip = Path.Combine(path, "CompressedData.zip");
                if (!ReliableExists(zip)) return;
                int n = 0;
                using (var za = ZipFile.OpenRead(zip))
                {
                    foreach (ZipArchiveEntry e in za.Entries)
                    {
                        string outPath = Path.Combine(path, e.FullName.Replace('/', Path.DirectorySeparatorChar));
                        if (string.IsNullOrEmpty(e.Name)) { Directory.CreateDirectory(outPath); continue; }
                        Directory.CreateDirectory(Path.GetDirectoryName(outPath));
                        using (var es = e.Open())
                        using (var fs = new FileStream(outPath, FileMode.Create, FileAccess.Write, FileShare.None))
                            es.CopyTo(fs);
                        n++;
                    }
                }
                try { File.Delete(zip); } catch { }
                Log.LogInfo("Extracted " + n + " entries from CompressedData.zip (" + path + ")");
            }
            catch (Exception e) { Log.LogError("manual extract failed: " + e); }
        }

        private static bool ReliableExists(string path)
        {
            try { using (File.Open(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite)) return true; }
            catch (FileNotFoundException) { return false; }
            catch (DirectoryNotFoundException) { return false; }
            catch { return true; }
        }

        public static bool FileExistsPrefix(object __instance, string fileName, ref bool __result)
        {
            try
            {
                var enumM = AccessTools.Method(__instance.GetType(), "EnumerateDirectories");
                var dirs = (IEnumerable)enumM.Invoke(__instance, null);
                foreach (object d in dirs)
                    if (ReliableExists(Path.Combine((string)d, fileName))) { __result = true; return false; }
                __result = false;
                return false;
            }
            catch { return true; }
        }

        public static Exception Swallow(Exception __exception)
        {
            if (__exception == null) return null;
            string msg = __exception.Message ?? "";
            if (__exception is IOException &&
                (msg.Equals("Success", StringComparison.OrdinalIgnoreCase)
                 || msg.IndexOf(": Success", StringComparison.OrdinalIgnoreCase) >= 0
                 || msg.StartsWith("Success ", StringComparison.OrdinalIgnoreCase)))
            {
                Log.LogWarning("Swallowed spurious Wine IO 'Success': " + msg);
                return null;
            }
            return __exception;
        }
    }
}

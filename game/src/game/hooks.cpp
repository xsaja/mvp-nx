// Hooks for default.xbe. A strong definition replaces the recompiled function at that address, for example:
//
// #include "xdk/hle.h"
//
// X86_EXTERN_FUNC(__imp__sub_00012345);
// X86_FUNC(sub_00012345) {
//     __imp__sub_00012345(ctx, base);  // the original
// }
//
// (2026-10-26: a verbose-only hook on sub_002DAA60, the game's pool free-size walk, found the Switch's oversized
// NtReadFile; see CLAUDE.md and the git history for it.)

#pragma once
#include <array>
#include <atomic>
#include <cstdint>
#include <vector>

#include "gpu/state.h"

namespace gpu {

enum class Topology : uint8_t { Points, Lines, Triangles };

// how the vertex shader finishes an element the input assembler reads raw, 4 bits per register in Assembled::decode
enum VertexDecode : uint8_t {
    kDecodeNone,
    kDecodeW1,       // 3 components read as 4: w = 1
    kDecodeInt,      // SHORT: integers to float
    kDecodeIntW1,    // SHORT3
    kDecodePacked,   // NORMPACKED3, 11:11:10 signed in a uint
    kDecodeFloat2H,  // x y w as 3 floats
};

// a buffer the draw reads: guest vertices as they are, or the float4 copy converted on the CPU
struct VertexBuffer {
    const uint8_t* src = nullptr;
    uint32_t bytes = 0, stride = 0;
};

// where input register r comes from: host vertex format (a DXGI_FORMAT), buffer, byte offset in the vertex
struct VertexElement {
    uint8_t format = 0, buffer = 0;
    uint16_t offset = 0;
};

// one draw's vertices and indices as the input assembler takes them
struct Assembled {
    std::vector<float> vertices;    // converted path: vertex_count * regs * 4
    std::vector<uint32_t> indices;  // converted path, or the list rebuilt for fans, quads and loops
    uint16_t regs = 0;              // input registers present, bit per v register
    uint32_t vertex_count = 0;
    Topology topology = Topology::Triangles;
    bool strip = false;             // line or triangle strip, drawn as a strip
    bool pretransformed = false;    // FVF XYZRHW
    uint64_t decode = 0;            // VertexDecode per register, 4 bits each
    std::array<VertexElement, 16> elements{};
    std::array<VertexBuffer, 16> buffers{};
    uint32_t buffer_count = 0;
    const void* index_src = nullptr;  // the title's 16 bit indices, or indices
    bool index16 = false;
    uint32_t index_count = 0;         // 0: an unindexed draw of draw_count vertices
    uint32_t draw_count = 0;
    int32_t base_vertex = 0;
    // MVP05: a line loop, fan, quad list, quad strip or polygon left as it is (its D3D number, 3 or 7 to 10) for a
    // backend that draws them natively (g_native_polygons); 0 otherwise
    uint8_t native_prim = 0;
    std::array<std::vector<uint8_t>, 16> gathered;  // raw vertices copied in draw order when the indices are sparse
};

// MVP05: the backend draws line loops, fans, quads, quad strips and polygons itself (deko3d does, Vulkan does not):
// raw-vertex draws of them keep their own vertices and indices instead of a rebuilt triangle list
inline std::atomic<bool> g_native_polygons{false};
// MVP05 perf: draws assembled from raw vertices, converted on the CPU, given a rebuilt index list; vertices converted
inline std::atomic<uint64_t> g_perf_asm_raw{0}, g_perf_asm_converted{0}, g_perf_asm_listed{0}, g_perf_asm_vertices{0};

// the FVF bits translated to the register layout the XDK's declarations use
void FvfInputs(uint32_t fvf, VertexShader& out);

// false when there is nothing to draw
// indices: the title's 16 bit indices, null for an unindexed draw
bool Assemble(const State& s, uint32_t prim, uint32_t start, uint32_t count, const uint8_t* indices, Assembled& out);

// The guest vertex bytes a draw reads, stream by stream, so a recorder can copy them when the draw is made instead of
// waiting for the render thread to read them (MVP05: the title reuses vertex memory right after a draw).
// base: the stream's vertex data as the draw sees it (its vertex 0); from, bytes: the part the draw reads
struct StreamSpan {
    uint32_t base = 0, from = 0, bytes = 0;
};
// false when Assemble would draw nothing; a stream the draw does not read keeps bytes 0
bool DrawStreamSpans(const State& s, uint32_t prim, uint32_t start, uint32_t count, const uint8_t* indices,
                     std::array<StreamSpan, 16>& out);
// a copy of a stream's span: the calling thread's Assemble reads the stream from it instead of guest memory
struct StreamCopy {
    StreamSpan span;
    const uint8_t* data = nullptr;
};
// null: guest memory again
void UseStreamCopies(const std::array<StreamCopy, 16>* copies);

}  // namespace gpu

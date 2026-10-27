# MVP Baseball 2005 (original Xbox, title 45410056), statically recompiled, as a Switch homebrew (NRO). MVP's modified
# XboxXBE-Recomp SDK (sdk/runtime) with this folder as the host in place of its Windows app/. Adapted from
# BLACK-NX-PORT's switch/CMakeLists.txt. The x86 code is recompiled on the PC first (tools/build_pc.cmd recompiles it): this build
# takes game/generated/game as it is.
#
# cmake -S switch -B build -G Ninja -DCMAKE_TOOLCHAIN_FILE=$DEVKITPRO/cmake/Switch.cmake -DCMAKE_BUILD_TYPE=Release
# Targets: mvp05_host_check (the runtime and this host alone, no recompiled code) and mvp05_nro.

cmake_minimum_required(VERSION 3.22)
project(mvp05_switch LANGUAGES C CXX ASM)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

get_filename_component(ROOT ${CMAKE_CURRENT_SOURCE_DIR}/.. ABSOLUTE)
set(HOST ${CMAKE_CURRENT_SOURCE_DIR})
set(GAME ${ROOT}/game/src)
set(SDK ${ROOT}/sdk)
set(THIRD ${ROOT}/third_party)
set(NVK_SDK ${ROOT}/nvk_sdk CACHE PATH "mesa-switch install (NVK)")
set(GEN ${ROOT}/game/generated/game CACHE PATH "recompiled code (tools/build_pc.cmd)")

# NVK's headers once it is built; the Khronos headers for the host check before that
if(EXISTS ${NVK_SDK}/include/vulkan/vulkan.h)
    set(VULKAN_INCLUDE ${NVK_SDK}/include)
else()
    set(VULKAN_INCLUDE ${THIRD}/Vulkan-Headers/include)
endif()

if(NOT EXISTS ${GEN}/image_symbols.h)
    message(FATAL_ERROR "No recompiled code in ${GEN}: run tools/build_pc.cmd")
endif()
set(HAVE_GEN OFF)
if(EXISTS ${GEN}/x86_func_mapping.cpp)
    set(HAVE_GEN ON)
    file(STRINGS ${ROOT}/game/config/game.toml GAME_PARTITIONS REGEX "^partitions *=")
    string(REGEX MATCH "[0-9]+" GAME_PARTITIONS "${GAME_PARTITIONS}")
    math(EXPR last "${GAME_PARTITIONS} - 1")
    set(GEN_SOURCES ${GEN}/x86_func_mapping.cpp)
    foreach(i RANGE ${last})
        list(APPEND GEN_SOURCES ${GEN}/x86_recomp.${i}.cpp)
    endforeach()
endif()
file(CONFIGURE OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/build_info.h CONTENT "#define MVP_NX_BUILD \"switch-0.1.1\"\n")
# the time of each build, in the log's first line (which NRO ran)
add_custom_target(build_stamp COMMAND ${CMAKE_COMMAND} -DOUT=${CMAKE_CURRENT_BINARY_DIR}/build_stamp.h
    -P ${CMAKE_CURRENT_SOURCE_DIR}/stamp.cmake BYPRODUCTS ${CMAKE_CURRENT_BINARY_DIR}/build_stamp.h)

# glslang with its HLSL front end (the SDK's shaders are HLSL), built here for the Switch
set(ENABLE_OPT OFF CACHE BOOL "" FORCE)
set(ENABLE_HLSL ON CACHE BOOL "" FORCE)
set(ENABLE_GLSLANG_BINARIES OFF CACHE BOOL "" FORCE)
set(ENABLE_SPVREMAPPER OFF CACHE BOOL "" FORCE)
set(GLSLANG_TESTS OFF CACHE BOOL "" FORCE)
set(GLSLANG_ENABLE_INSTALL OFF CACHE BOOL "" FORCE)
set(BUILD_EXTERNAL OFF CACHE BOOL "" FORCE)
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
# its precompiled header is named by an MSYS path (/c/...) the Windows-hosted GCC cannot open
set(CMAKE_DISABLE_PRECOMPILE_HEADERS ON)
add_subdirectory(${THIRD}/glslang ${CMAKE_CURRENT_BINARY_DIR}/glslang EXCLUDE_FROM_ALL)
add_subdirectory(${THIRD}/tomlplusplus ${CMAKE_CURRENT_BINARY_DIR}/tomlplusplus EXCLUDE_FROM_ALL)
# the deko3d renderer: the SPIR-V the shaders compile to as GLSL (SPIRV-Cross), and uam, which makes it DKSH
add_subdirectory(${THIRD}/uam ${CMAKE_CURRENT_BINARY_DIR}/uam EXCLUDE_FROM_ALL)
set(SPVC ${THIRD}/SPIRV-Cross)
add_library(spirv_cross_glsl STATIC ${SPVC}/spirv_cross.cpp ${SPVC}/spirv_parser.cpp ${SPVC}/spirv_cross_parsed_ir.cpp
                                    ${SPVC}/spirv_cfg.cpp ${SPVC}/spirv_glsl.cpp)
target_include_directories(spirv_cross_glsl PUBLIC ${SPVC})
target_compile_options(spirv_cross_glsl PRIVATE -O2 -w)
set(IMGUI_SOURCES ${THIRD}/imgui/imgui.cpp ${THIRD}/imgui/imgui_draw.cpp ${THIRD}/imgui/imgui_tables.cpp
    ${THIRD}/imgui/imgui_widgets.cpp ${THIRD}/imgui/backends/imgui_impl_vulkan.cpp)

# the SDK's runtime but its Windows parts; MVP's xdk/d3d8.cpp and xdk/dsound.cpp stay (they carry MVP's fixes), and
# gpu/render_thread.cpp has its own ARM path
file(GLOB RUNTIME_SOURCES ${SDK}/runtime/*/*.cpp)
list(FILTER RUNTIME_SOURCES EXCLUDE REGEX "/runtime/app/|/core/input\\.cpp$|/gpu/d3d12\\.cpp$|/audio/xaudio2\\.cpp$")
file(GLOB GAME_HOST_SOURCES CONFIGURE_DEPENDS ${GAME}/*/*.cpp)
file(GLOB SWITCH_SOURCES CONFIGURE_DEPENDS ${HOST}/*.cpp)
set(HOST_SOURCES ${RUNTIME_SOURCES} ${GAME_HOST_SOURCES} ${SWITCH_SOURCES})

set(HOST_INCLUDES ${HOST}/compat ${SDK}/harness/compat ${HOST} ${GAME} ${SDK}/runtime ${GEN} ${CMAKE_CURRENT_BINARY_DIR}
    ${THIRD}/glslang ${VULKAN_INCLUDE} ${THIRD}/SPIRV-Cross ${THIRD}/uam)
# x86 chars are signed, as the game's code and the runtime were written for
set(HOST_OPTIONS -fno-strict-aliasing -fsigned-char)
# every log level (info and debug lines too) in this release build, for console diagnostics
option(MVP05_VERBOSE_LOG "log info and debug lines" OFF)
if(MVP05_VERBOSE_LOG)
    list(APPEND HOST_OPTIONS -DXBE_VERBOSE_LOG)
endif()
set_source_files_properties(${IMGUI_SOURCES} PROPERTIES COMPILE_DEFINITIONS IMGUI_DISABLE_DEFAULT_SHELL_FUNCTIONS)
set_source_files_properties(${HOST_SOURCES} PROPERTIES COMPILE_OPTIONS "-include;${HOST}/compat/crt.h")
set_source_files_properties(${HOST}/vk_shader.cpp PROPERTIES COMPILE_DEFINITIONS ENABLE_HLSL)

# the host and runtime alone, to find their compile errors before the long build of the recompiled code
add_library(mvp05_host_check OBJECT ${HOST_SOURCES} ${IMGUI_SOURCES} ${HOST}/switch_elf_stubs.c)
target_include_directories(mvp05_host_check PRIVATE ${HOST_INCLUDES})
target_include_directories(mvp05_host_check SYSTEM PRIVATE ${THIRD}/imgui)
target_compile_options(mvp05_host_check PRIVATE ${HOST_OPTIONS})
target_link_libraries(mvp05_host_check PRIVATE tomlplusplus::tomlplusplus)

if(HAVE_GEN)
    # the recompiled code without FMA, so its float results match the console's
    set_source_files_properties(${GEN_SOURCES} PROPERTIES COMPILE_OPTIONS
        "-O2;-w;-fno-strict-aliasing;-fsigned-char;-ffp-contract=off")
    add_executable(mvp05 ${HOST_SOURCES} ${GEN_SOURCES} ${IMGUI_SOURCES} ${HOST}/switch_elf_stubs.c)
    add_dependencies(mvp05 build_stamp)
    set_target_properties(mvp05 PROPERTIES OUTPUT_NAME mvp05)
    target_include_directories(mvp05 PRIVATE ${HOST_INCLUDES})
    target_include_directories(mvp05 SYSTEM PRIVATE ${THIRD}/imgui)
    target_compile_options(mvp05 PRIVATE ${HOST_OPTIONS})
    # NVK, linked statically as BLACK-NX-PORT does; its own (HLSL-less) glslang is left out. mesa-switch's unified
    # install (26.2.4) has libvulkan.a beside the parts it may still need (libnvk.a, libnak_rs.a with NAK's Rust code,
    # libnil.a...): all of them in one group, but the OpenGL ones; an older build's .rlib files too
    file(GLOB NVK_ARCHIVES ${NVK_SDK}/lib/lib*.a)
    list(FILTER NVK_ARCHIVES EXCLUDE REGEX "/lib(EGL|GL|GLESv1_CM|GLESv2|glapi)\\.a$")
    list(REMOVE_ITEM NVK_ARCHIVES ${NVK_SDK}/lib/libvulkan.a)
    file(GLOB NVK_RLIBS ${NVK_SDK}/lib/*.rlib)
    target_link_libraries(mvp05 PRIVATE
        tomlplusplus::tomlplusplus glslang glslang-default-resource-limits uamlib spirv_cross_glsl deko3d
        -Wl,--allow-multiple-definition
        -Wl,--start-group
        ${NVK_SDK}/lib/libvulkan.a
        ${NVK_ARCHIVES}
        ${NVK_RLIBS}
        zstd expat z nx stdc++ m pthread
        -Wl,--end-group)

    nx_generate_nacp(OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/mvp05.nacp
        NAME "MVP Baseball 2005" AUTHOR "mvp-nx" VERSION "0.1.1")
    set(ICON ${HOST}/icon.jpg)
    if(EXISTS ${ICON})
        nx_create_nro(mvp05 NACP ${CMAKE_CURRENT_BINARY_DIR}/mvp05.nacp ICON ${ICON})
    else()
        nx_create_nro(mvp05 NACP ${CMAKE_CURRENT_BINARY_DIR}/mvp05.nacp)
    endif()
    # nx_create_nro makes the mvp05_nro target
endif()

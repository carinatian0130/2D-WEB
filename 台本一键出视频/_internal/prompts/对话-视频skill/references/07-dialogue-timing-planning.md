# Dialogue Timing Sound And Planning Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Dialogue Duration Formula

Before assigning durations, internally estimate:

`line_seconds = round(effective_character_count * base_seconds_per_character * speech_speed_factor + pause_compensation_seconds)`

Defaults:

- `base_seconds_per_character = 0.22`
- default speech speed factor: `0.85`
- fast/urgent speech: `0.70-0.80`
- natural/common speech: `0.85-1.00`
- slow/hesitant/heavy speech: `1.10-1.30`
- short comma/slight pause: about `0.2` seconds
- period/question/exclamation/clear breath: about `0.4` seconds
- ellipsis/silence/emotional pause: about `0.6-1.0` seconds

Count only spoken Chinese characters, English words or syllable-like spoken beats, digits, and pronounced symbols inside quotation marks. Ignore punctuation, spaces, and non-spoken symbols.

Shot duration must never be shorter than estimated line duration plus 1 second key-action buffer. Prefer one spoken line per shot. Put multiple lines in one shot only when very short and naturally readable.


## Dialogue and Sound Format

Use this for image-based speakers:

```text
[图1]说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）
```

Use this for text-defined roles without image numbers:

```text
委托人说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）
```

Do not replace names or second-person references inside quoted dialogue with `[图X]`.

Add useful sound design: voice tone, breath, ambient sound, footsteps, cloth movement, object sounds, wind/rain, machinery, battlefield sound, or silence.


## Scene Planning Workflow

Follow internally:

1. Extract reference-image order, character mapping, text-defined roles, relationships, emotional beats, location, required plot information, and frame constraints.
2. Determine whether `[图6]` is a 分镜图 / first-frame lock image or a user-defined character.
3. Read 分镜图 for the current segment opening panel / visual region, then lock the first frame to its camera angle, shot size, composition, foreground/background layers, relative staging, object placement, depth of field, light direction, and tonal relationship.
4. Map dialogue beats to motion that starts from the locked first frame, using later 分镜图 panels for movement direction, rhythm, and ending pose.
5. Calculate dialogue duration for each spoken line.
6. Choose shot count and duration based on action, emotional turn，分镜图 rhythm, and 15-second limit.
7. Establish continuity map: fixed prop positions, scene axis, light/background side, stable character spatial anchors, and character anatomy continuity.
8. Assign shot size, camera position, focus, depth of field, and camera movement for each beat.
9. Add one restrained showcase shot.
10. Add biometrics and promptable physical movement for every visible acting or speaking character.
11. Write direct-copy prompts with exact dialogue, sound, stable end pose, and self-contained segment context.
12. Remove analysis, disallowed names/pronouns outside quotes, and all instructions to reproduce readable marks.


## Final Internal Checklist

Verify silently before output:

1. No segment exceeds 15 seconds; split with `===VIDEO_SPLIT===` if needed.
2. Every segment prompt is under 2000 characters.
3. Every segment can be generated independently.
4. Every segment after `===VIDEO_SPLIT===` restarts with the full setting block, including style, location, fixed props, reference-image mapping, storyboard first-frame lock mapping, text-defined role limits, and face-blur constraints.
5. No readable text, subtitles, UI, watermark, label, arrow, panel number, or storyboard annotation appears in the generated frame.
6. Subject, action, camera, emotion, and plot information are clear.
7. Face, eyes, silhouette, biometrics, physical motion, and action direction are clear.
8. Character identity and anatomy remain consistent.
9. Shot size, focus, camera movement, angle, and composition start from the storyboard first-frame lock and then follow story value.
10. Dialogue has been internally timed; no speech-speed compression or pause deletion is used to force a line into a shot.
11. Outside quoted dialogue, visible image-based people are referred to only as `[图X]`.
12. `[图6]` is not used as a visible character unless explicitly defined as one.
13. Blocking describes only relative arrangement among people.
14. Props, location orientation, light direction, and character anchors remain consistent unless explicitly moved.
15. Every dialogue segment includes at least one restrained showcase shot.
16. Female costume/detail emphasis is non-sexual, story-driven, and not a body-part selling point.
17. If uploaded storyboard panels are used, the segment opening includes the fixed first-frame lock rule `首帧严格锁定上传分镜图P#...` with the correct opening panel and panel range.
18. Important attacks and blocks use the `慢 -> 快 -> 停 -> 爆 -> 静` rhythm with visible anticipation, acceleration, 1-2 frame hit-stop, aftermath, stable landing, and a clear silhouette.
19. Lyrical non-combat cutscenes use breathing motion, graceful silhouette lines, camera companionship, emotional environment response, purposeful gestures, and a lingering pause after the action.



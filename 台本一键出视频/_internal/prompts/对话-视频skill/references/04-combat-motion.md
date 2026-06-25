# Combat Motion And Impact Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Combat Tempo Selection Rule

When the full dialogue/script contains fighting, weapon clashes, monster attacks, transformations with impact, explosions, knockback, or action pursuit, choose the combat tempo once for the complete dialogue before splitting into 15-second video segments. Apply that tempo across all `===VIDEO_SPLIT===` segments in the same generated prompt. Do not re-decide tempo per segment.

Use one of two optional combat tempo modes:

### Single-Impact Showcase Mode

Use this when the scene needs to emphasize one decisive punch, slash, monster hit, clash, explosion, or dramatic turning-point impact.

Rules:

1. Allow slow motion for only one beat in the complete dialogue, not once per split.
2. Put the slow motion around the chosen showcase impact: eye/hand/foot/weapon wind-up, the half-second before contact, or the exact contact moment.
3. After the decisive contact is readable, return to normal or fast speed for knockback, debris, recoil, landing, and reaction. Do not let the victim float, hang, or drift slowly unless the user explicitly asks for suspended supernatural time.
4. Use insert close-up -> low-angle preparation -> decisive impact -> brief shake -> fast result -> stable pose/reaction.
5. If writing multiple `===VIDEO_SPLIT===` segments, mention the slow-motion showcase only in the segment that contains the selected impact. Other combat segments should use normal/fast speed.

Good wording pattern:

```text
本完整视频采用单次打击突出节奏，慢动作只用于这一击。参考P01的低位广角冲击感，先给[图5]握拳和脚踩地的短促特写，出拳前一瞬轻微慢放；拳头接触心口的瞬间短促震动，随后立刻恢复高速，[图7]被打飞、尘土炸开、旁观者后退，结尾停在受击结果。
```

### Fast Exchange Mode

Use this when the scene is a back-and-forth fight, chase, repeated blocks, combo exchange, monster flurry, crowd panic, or any sequence where speed and danger matter more than one heroic hit.

Rules:

1. Do not use slow motion.
2. Use fast cuts, low-angle wide shots, close wide-angle contact, whip pans, short hit shakes, fast push-ins, sudden blocks, immediate rebounds, and quick reaction shots.
3. Hits, blocks, deflections, knockbacks, and dodges must complete quickly: contact -> sharp shake -> immediate result -> fast follow-up.
4. Do not write slow drifting, hovering, delayed floating, long camera shake, or repeated pose-holds.
5. Use reaction shots to show consequences: enemy thrown back, weapon vibrating, ground cracking, bystanders retreating, dust expanding, teammates shifting stance.

Good wording pattern:

```text
本完整视频采用激烈来回快打节奏，不使用慢动作。参考P10的横向拦截关系，[图3]快速横挡藤蔓，接触瞬间短促震动，藤蔓立刻弹开并再次抽向侧面，镜头甩向后续威胁，尘土和花瓣碎片快速扫过前景。
```

### Hit-Stop Impact Formula

For strong physical hits, use this formula when it fits the selected combat tempo:

`low-angle upshot -> fast push-in -> hit-stop freeze -> energy trail -> fast knockback reaction`

Rules:

1. Use low-angle upshot to make the attacker, weapon, monster limb, or impact source feel huge.
2. Use fast push-in at the attack burst.
3. Use hit-stop only at the exact contact moment, about 2-4 frames. Hit-stop is not slow motion.
4. Add a clear energy trail, impact arc, dust burst, weapon blur, or force line following the attack direction.
5. After hit-stop, the target reacts immediately at high speed: body snaps back, flies out, crashes, rolls, or is thrown aside.
6. Knockback reaction must be fast, sudden, and decisive. Do not make it slow, floating, delayed, or suspended unless the user explicitly asks for supernatural suspended time.

### Anticipation, Impact, and Silhouette Rule

For any important punch, weapon strike, monster attack, magic hit, knockback, or decisive block, build the action with this rhythm:

`slow preparation -> fast burst -> 1-2 frame hit-stop -> explosive result -> still landing`

In Chinese prompt wording, treat this as: `慢 -> 快 -> 停 -> 爆 -> 静`.

Rules:

1. The `slow` part means visible anticipation and weight loading, not repeated slow motion. Show the body lowering, arm pulling back, weapon or fist gathering energy, feet grinding into the ground, cloth and hair pulled by pressure, or the enemy feeling pressure before contact.
2. The `fast` part means the attack line suddenly lengthens and accelerates: stretched body arc, fast push-in, whip pan, weapon blur, long limb/weapon silhouette, or sudden distance compression.
3. The `stop` part is a 1-2 frame impact hold at the exact hit, block, or collision point, making the contact feel heavy.
4. The `burst` part is the immediate consequence: enemy flies out, dust expands, fragments scatter, weapon vibrates, ground cracks, crowd recoils, or petals/smoke sweep through foreground.
5. The `still` part is the readable landing: camera settles, attacker pose holds for 0.5-1 second, target's final direction is clear, dust continues drifting, and the audience can read what changed.
6. Before a major action, use a short emotional insert close-up when useful: eyes narrowing, hand tightening on a weapon, foot crushing loose ground, weapon energy brightening, clothes or hair pushed by airflow, or the enemy's pressured reaction.
7. Keep the silhouette clear at the attack peak. Use a strong outline pose, large arm/weapon/leg arc, obvious center-of-gravity shift, and readable limb separation. Do not let the body collapse into a tangled shape.
8. At the hit moment, give a clean freeze-pose or impact-frame composition, with the contact point, attack direction, and target reaction all readable.

Good wording pattern:

```text
先给短促蓄力特写：脚掌压碎地面、肩膀下沉、手臂后拉、武器能量沿刃口亮起；随后动作突然拉长并高速冲出，镜头快速推近和甩镜跟随，命中瞬间停一两帧形成沉重砸中感，接着敌人立刻飞出、尘土向外扩散、碎屑扫过前景，最后镜头回稳在攻击者清晰剪影和敌人落点。
```

If a script contains both a major showcase hit and later fast exchanges, use Single-Impact Showcase Mode for the full dialogue, spend the one slow-motion beat on the single most important impact, and keep all other fight actions fast.

Avoid:

- assigning a new slow-motion beat to every 15-second segment
- saying every impact is slow motion
- making a hit land slowly when the user wants a fast exchange
- making knockback, falling, or recoil linger after the impact has already landed
- using slow motion in monster/crowd chaos unless it is the single chosen showcase beat





--- SKILL.md ---

---
name: seedance-dialogue-c
description: 将对话脚本、场景描述、角色/参考图映射、首尾帧、分镜首帧锚定图、分镜参考图和粗略剧情节拍转换成可直接复制到 Seedance AI 的单段视频提示词；视频时长以网页或用户输入指定为准，未指定时才默认15秒。适用于横版16:9高质量3D动漫开放世界游戏过场、精确保留台词、复刻分镜面板、把上传分镜图作为 image-to-video 首帧锁帧参考、锁定参考图角色、战斗与唯美运动、道具/地点连续性、人体一致性和可控电影镜头运动。
---

# Seedance 对话视频 C

## 目标

将用户提供的对话、舞台指示、角色映射、参考图、首尾帧、分镜表、分镜图或粗略剧情节拍，转换为可以直接复制使用的 Seedance AI 单段视频提示词；时长以当前输入/网页片段目标时长为准。

默认输出为横版16:9、高质量3D动漫开放世界游戏过场、实时游戏引擎渲染、电影感光影、清晰可读的角色表演、稳定的空间连续性，以及可提示的镜头/动作运动。

除非用户明确要求分析、诊断或编辑技能，否则只输出可用的提示词内容。

## 优先级

按以下优先级执行：

1. 用户最新明确给出的映射、设定、面板范围、角色列表或输出要求。
2. 本文件中的硬性输出契约和视频限制。
3. 本文件中与当前场景相关的专项规则。
4. 默认固定映射和风格假设。

如果用户重新映射图片，必须服从用户。例如用户说 `【图5】为分镜图首帧锚定图`，就把 `【图5】` 当作首帧锁帧参考图，即使默认映射写的是 `【图6】`。

## 输出契约

下文的“可读标记”统一指：字幕、对话框、标题卡、UI 图标、说明牌、水印、logo 文字、标签、箭头、面板编号、彩色标记、分镜注释和任何会被画面读出的文字/符号。

每次输出都必须遵守：

1. 用户一次给出的全部台词、语境说明、分镜图和参考图，默认共同代表一个单段视频整体；不要拆成多个视频。
2. 输出一个完整单段视频提示词，视频时长必须写为用户或网页输入指定的目标时长；完全没有指定时才默认写为 `15秒`。
4. 提示词必须自洽，不写“承接上一段”“继续刚才”“同上”或“接前面“。
5. 精确保留引号内台词，包括姓名、昵称、第二人称称呼、标点含义、语义和情绪态度。
6. 每句台词后立即加入中文声音指导。
7. 不生成可读标记。
8. 每次引用图片编号、角色参考图或分镜首帧锚定图，都必须使用全角格式 `【图#】`，例如 `【图1】`、`【图5】`；不要使用半角方括号格式。
9. 如果输入来自网页工具，人物和场景必须使用网页素材库稳定统一名称：人物写 `char:id`，场景写 `scene:id`。引号外不要写中文人物名或中文场景名，例如不要写“雅琳”“小星”“客栈”；不要写 @char/@scene。可以写成 `【图1】char:abc123` 或直接 `char:abc123`。
10. 每次输出都必须在设定块中写 `角色锁：...`。用户提供角色锁时逐字采用；用户未提供时，根据最新角色映射、参考图和台词建立简洁角色锁。角色锁只包含可见或剧情要求出现的角色，不加入缺席角色。
11. 引号外不要使用角色姓名、昵称、身份标签、性别代词，或“他”“她”“某人”“少年”“少女”等指代词。可见图片角色只写为 `【图#】char:id` 或 `char:id`；只有无法避免时才使用用户定义的文本角色标签。
12. 调度只描述可见人物之间的相对关系，不把场景、道具或环境位置混入人物调度。
13. 给可见的说话或行动角色加入简洁体征：年龄感、脸/眼/体态印象、姿势、身体紧张度、呼吸状态和用户提供的人设特征。
14. 每个镜头都加入可提示的身体动作。
15. 保持固定道具位置、角色空间锚点、地点连续性、光线方向和天气/气氛一致。
16. 保持角色身份、人体结构、脸、发型、服装、轮廓、相对比例和手部归属一致。
17. 每个对话视频至少包含一个克制展示镜头。

## 默认风格

除非用户给出其他风格，否则使用以下基准：

```text
横版16:9，高质量3D动漫开放世界游戏过场，实时游戏引擎渲染，电影感光影，物理可信空间，角色轮廓清晰，眼神可读，表演克制但有情绪，前景/中景/背景层次明确。【图6】作为首帧锚定图 / image-to-video first-frame lock：视频第一帧严格匹配【图6】中当前片段起始格或对应视觉区域的构图、人物相对站位、镜头角度、主体比例、前中后景、景深和光影关系；前0.5-1秒先保持锁帧构图，再从该首帧自然运动；不生成可读标记。角色外观严格参考【图1】-【图5】，全段保持同一张脸、同一发型、同一服装、同一体型比例和同一轮廓；禁止多头、多脸、多手、多臂、漂浮手、融合身体、畸形手指或重复肢体。
```

根据脚本调整场景描述、道具、光线和环境。除非脚本本身是客栈/酒馆场景，否则不要固定套用酒馆细节。

当当前对话视频任务使用市集街道设定且 `【图5】` 是分镜首帧锚定图映射时，每条提示词开头都使用此完整设定块：

```text
横版16:9，高质量3D动漫开放世界游戏过场，实时游戏引擎渲染，scene:场景素材ID，木栅栏、摊棚、碎箱、尘土和远处市门口岗位固定。角色外观只参考【图1】char:角色素材ID、【图2】char:角色素材ID、【图3】char:角色素材ID、【图4】char:角色素材ID；【图5】作为首帧锁帧参考图：视频第一帧严格匹配【图5】中当前片段起始格或对应视觉区域的构图、站位、镜头角度、主体比例、前中后景、景深和光影节奏；前0.5-1秒保持锁帧构图，再从该首帧自然运动；不生成可读标记。文本定义角色只在远处检查棚/市门口岗位出现，不加入角色锁；未出现角色不要加入角色锁或画面。忽略并不要还原参考图中被模糊处理的脸部细节。
```

## 参考图映射

除非用户明确重新映射，否则使用以下默认映射：

```text
【图1】=char:角色素材ID
【图2】=char:角色素材ID
【图3】=char:角色素材ID
【图4】=char:角色素材ID
【图5】=char:角色素材ID
【图6】=分镜图 / 分镜 / 首帧锚定图 / first-frame lock
```

将 `【图1】-【图5】` 视为角色外观参考。将 `【图6】` 视为分镜、分镜图或首帧锚定图：生视频接口必须把它作为 image-to-video 的起始参考帧使用，视频第一帧严格锁定其构图、相对站位、景别、镜头角度、主体比例、前中后景、景深、光线方向、道具互动、视线轴线和情绪状态；后续运动节奏从这个首帧自然展开。

绝不要把 `【图6】` 当作可见角色、说话者、调度参与者、动作主体或台词对象。绝不要把分镜图本身生成成画面中可见物体。

如果最终提示词需要写参考说明，写：`【图6】作为首帧锚定图 / image-to-video first-frame lock；视频第一帧严格匹配【图6】中当前片段起始格或对应视觉区域的构图、人物相对站位、镜头角度、主体比例、前中后景、景深和光影节奏，前0.5-1秒先保持锁帧构图，再从该首帧自然运动；不生成可读标记。`

如果用户要求纯提示词，就省略参考说明行，只在内部应用映射。

如果用户定义文本角色，将其保留为文本定义角色，不要加入图片参考锁定。不要把缺席角色加入角色锁或生成画面。

## 角色一致性与人体结构

每个镜头都保持角色身份和人体结构一致。除非用户明确要求状态变化，否则每个可见角色都必须保持同一参考图身份、脸、发型、服装、身体比例、轮廓和相对身高。

始终避免：重复头部、额外的脸、额外的手臂、额外的手、漂浮手、融合身体、畸形手指、重复肢体，以及脸、发型、服装或身体比例突然漂移。

当角色拥抱、扶持、抓握、近距离站立或身体重叠时，要清楚写出手部归属和最终手位：

```text
谁的手 -> 起点 -> 接触点 -> 最终停留点
```

优先使用少量清晰接触点，不要写模糊纠缠的身体重叠。保持脸部分离、肩线可读、手臂能从肩膀追踪到手，并确保每只可见手都归属于具体 `【图#】char:id` 或文本定义角色。

## 分镜首帧锁帧规则

将分镜图视为首帧锚定图 / image-to-video first-frame lock 和后续运动蓝图，而不是画面中的可见物体。

视频生成时，上传分镜图必须作为真实首帧参考图使用：视频第一帧严格匹配当前片段起始格或对应视觉区域的构图、镜头高度、镜头角度、景别、人物左右/前后位置、主体大小比例、前景遮挡、中景人物、背景空间位置、视线方向、透视纵深、景深、光线方向和色调关系。前0.5-1秒先保持这个锁帧构图，再开始自然动作、镜头运动、表情和环境微动。

如果上传分镜图是一张多格分镜表，当前片段的第一格/起始视觉区域就是首帧锚定；后续格子只用于指导动作方向、剪辑节奏、运动路径和结尾落点。不要把整张分镜表当成要出现在画面中的拼贴图，也不要生成格线、编号或标注。

从分镜图内部提取：构图中心、角色相对位置、镜头角度、景别变化、前景/背景层次、视线关系、动作方向、手部路径、身体转向、道具接触、道具碰撞或震动、光线方向、情绪冲击和稳定结束姿态。

不要复现可见的分镜图工件；统一写成不生成可读标记。

当用户说要模仿、跟随、复制或匹配分镜图时，每个生成镜头都必须明确锁定到对应面板编号或视觉面板位置。提示词要写成镜头构图复刻，而不是松散的故事改编。

每个镜头都加入等价于以下内容的直接表述：

```text
严格复刻上传分镜图第N格的画面构图、镜头角度、镜头高度、镜头倾斜、景别、人物左右/前后位置、主体大小比例、前景遮挡、中景人物、背景门窗/墙面/铁栏位置、视线方向和透视纵深；只把标记翻译成自然动作和镜头运动，不生成可读标记。
```

每次使用上传分镜面板的输出，都要在段落开头加入此规则一次，并把 `P#-P#` 改成该段实际使用的面板范围：

```text
首帧严格锁定上传分镜图P#起始格或对应视觉区域的构图、镜头高度、人物左右位置、主体比例、前景遮挡、背景街道纵深、景深和光影节奏；前0.5-1秒保持锁帧构图，再按照P#-P#的动作方向加入低机位广角近景、快速推近、甩镜、命中震动和反应镜头。
```

不要只用 `中景`、`低近景` 或 `门口广角` 这类通用镜头标签替代分镜面板。镜头必须写出精确的面板复刻目标，以及被复制的具体构图元素。

如果分镜图包含12格，默认将提示词镜头1-12对应面板1-12，除非用户明确要求合并、省略或重排。如果后续段落使用面板5-8或9-12，段落开头约束必须点名这些面板，并保留其精确镜头角度，不能只写 `参考上传分镜图`。

如果分镜图包含分镜制图标记，只能在内部理解并翻译为自然视频语言；最终 Video Prompt 不得保留任何分镜制图词：

- 身体/动作标记 -> 角色运动、身体运动、手部路径、转身、接近、后退
- 镜头标记 -> 镜头推进、横移、摇摄、跟随、视线转移、焦点变化
- 构图标记 -> 视觉轴线、相对位置、视线关系、构图中心
- 光线标记 -> 光源方向、高光、阴影衰减、环境变化
- 冲击标记 -> 道具碰撞、情绪余震、紧张停顿、移动后的震动

绝不要按颜色描述分镜标记，也不要要求模型绘制任何标记。

当用户额外提供生成场景图、分镜面板或场景剧照作为 Seedance 镜头参考时，将其视为首帧锁帧参考或硬构图锚点，而不是逐字重绘的平面图片。先锁定不可妥协的视觉锚点，再把其余内容翻译成自然运动：

1. 锁定图像锚点：镜头高度、镜头角度、景别、前景遮挡、角色左右/前后位置、主体比例、门/窗/墙/光线位置、视线轴和纵深方向。
2. 把锚点绑定到剧情动作：通过有动机的行为解释每个人为什么处在该位置，例如守卫、躲藏、回头、退到门口、听见脚步、护住另一角色或准备回答。
3. 把标记翻译成身体行为：箭头、标签、彩色点、面板编号、粗略草图符号和导演备注，都转成镜头移动、身体转向、视线变化、手部运动、焦点变化、光线方向或调度动机。
4. 保留自然微动作：加入克制呼吸、肩膀紧张、延迟视线转移、手部迟疑、衣物/盔甲惯性、脚步、门的运动和焦点变化。
5. 保持参考图前后的连续性：定义上一镜头最终位置和下一镜头开始位置。如果新角色入场，先建立门口/轴线，再用镜头移动或焦点变化，不要硬切造成空间断裂。
6. 结束在稳定构图上：最后0.5-1秒停在清晰可读的布局，例如前景遮挡 -> 中景说话者 -> 后景隐藏听者。

推荐写法：

```text
严格参考上传场景图的构图和镜头角度：镜头保持在牢房内侧低机位，前景遮挡形成窥视感，【图2】站在中景门边半挡住【图1】，【图1】位于后景低位，右侧高窗冷光斜射进牢房；不生成可读标记。把图中的方向提示翻译成【图2】听到脚步后扭头、肩膀收紧、身体自然挡住【图1】，镜头只做轻微低位呼吸感，结尾稳定在前景遮挡—中景【图2】—后景【图1】的三层纵深构图。
```

## 对话时长与声音

分配时长前，内部先估算：

```text
台词秒数 = round(有效字符数 * 每字基础秒数 * 语速系数 + 停顿补偿秒数)
```

默认值：

- 每字基础秒数：`0.22`
- 默认语速系数：`0.85`
- 快速/急促语速：`0.70-0.80`
- 自然/普通语速：`0.85-1.00`
- 缓慢/迟疑/沉重语速：`1.10-1.30`
- 短逗号/轻微停顿：约 `0.2` 秒
- 句号/问号/叹号/明显换气：约 `0.4` 秒
- 省略号/沉默/情绪停顿：约 `0.6-1.0` 秒

只计算引号内实际发声的中文字符、英文单词或类似音节的发声单位、数字和会读出的符号。忽略标点、空格和非发声符号。

镜头时长绝不能短于估算台词时长加1秒关键动作缓冲。优先每个镜头放一句台词。只有台词很短且自然可读时，才把多句放进同一个镜头。

图片参考说话者使用：

```text
【图1】说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）
```

没有图像编号的文本定义角色使用：

```text
委托人说道：“台词”（年龄感、声线质感、语气、情绪、力度、语速）
```

不要把引号内的名字或第二人称指代替换成 `【图#】`；引号外统一使用 char:id。加入有用的声音设计：声线、呼吸、环境声、脚步、衣物摩擦、物体声、风雨声、机械声、战场声或沉默。

## 镜头格式

每条提示词都使用按镜头分段的段落行。每个镜头必须以以下格式开头：

```text
分镜N【X秒】
```

其中 `N` 是顺序编号，`X` 是整数秒数。

格式范例：

```text
分镜1【4秒】 中近景，主体动作与构图描述。角色说道：“原台词”（声线、语气、情绪、语速）。动作反应、道具位置、镜头运动、声音细节。结尾稳定在明确的手、道具、视线或情绪落点。
```

要求：

1. 时长后先写景别或镜头位置，例如 `中近景，`、`中景，`、`高位斜角中远景，`、`低桌面侧拍，`。
2. 引号内精确保留原台词。
3. 台词后立即在中文括号中加入声音指导。
4. 每个镜头写成一个连贯段落，合并镜头、调度、动作机制、台词、物件声音、环境声和稳定结尾。
5. 避免 `主体：`、`构图：`、`动作：`、`台词：` 这类清单标签，除非用户要求拆解。
6. 没有台词的镜头不要写 `台词：无。`，除非为了清晰必须说明；自然写无对白动作。
7. 避免突兀切走。用有动机的镜头路径衔接群体反应，并在转移重点前表现上一动作的落定。

## 运动选择

写作前先为15秒整体选择运动语言：

- 战斗或危险场景：使用战斗运动规则。重要攻击和格挡使用 `慢 -> 快 -> 停 -> 爆 -> 静`：可见蓄势、加速、1-2帧命中停顿、爆发结果、稳定落点和清晰剪影。
- 抒情非战斗过场：使用呼吸感动作、优美轮廓线、陪伴式镜头、由环境承载情绪、有目的的手势和余韵停顿。
- 安静对话：使用可控自然运动：克制的演员动作、轻微镜头漂移、光线视差、眼神接触、手部迟疑、呼吸和稳定情绪落点。
- 有活力但非战斗的动作：使用动态电影运动：有动机的镜头路径、演员身体方向、前景视差、环境反应、衣物/头发二级运动和稳定结束姿态。

### 动态电影运动

当用户要求更强运动、电影感能量、动作感、非静态输出，或指出结果僵硬时使用。

1. 每个镜头至少给两层运动：有动机的镜头运动、演员身体运动、前景视差、环境反应、物体运动、二级运动、衣物/头发运动或焦点变化。
2. 镜头运动要有清晰起点、路径、速度和结束画面：低前景推进、横移穿过遮挡物、手持微晃、过肩环绕、摇臂下落、俯拍拉远、快速摇向反应、快速推近并停在脸上。
3. 演员动作要有物理方向：预备动作、重心转移、身体惯性、延迟反应、向前/后迈步、肩膀扭转、手部伸出路径、转头、视线转移、躯干后坐、抓取/放开物体、由呼吸带动的胸腔运动、袖子或头发的跟随惯性。
4. 加入视差和环境反应：前景物体/身体边缘靠近镜头，中景演员可读，背景以不同速度滑动，尘土/布料/餐具/钱币/树叶/窗帘/水/光/烟雾响应运动。
5. 每个镜头最后0.5-1秒结束在稳定姿态、固定视线、道具接触或情绪节拍上。

### 可控自然运动

用于对话密集场景、平静谈话，或输出不应过度戏剧化时。

1. 镜头运动保持慢到中速且观察感明确：轻缓推进、慢速横移、小幅过肩调整、温和手持呼吸感、短焦点转移。
2. 演员动作保持克制：预备、轻微重心变化、延迟反应、伸手、杯子/道具接触、半步、肩膀落定、视线变化、呼吸、手指收紧、袖子/头发跟随。
3. 轻量使用视差：前景桌边、杯子、袖子、肩膀、门口、窗帘、尘土、烛光或烟雾可轻微移动，但不要遮住脸。
4. 通过停顿、眼神接触、姿态、呼吸、手部迟疑和克制表情变化表现情绪。
5. 安静对话优先使用2-3个较长镜头，而不是大量快速切换。
6. 除非用户要求，否则避免战斗式动词。需要平静运动时，将“快速/猛然/冲出/爆发/急速/甩出”替换为“缓慢/轻微/短暂停顿/克制/自然/稳定/逐渐/轻轻”。

### 非战斗唯美过场运动

用于抒情、美丽的非战斗过场、情绪角色时刻、风景转场、回忆感片段、安静旅行，或类似 Wuthering Waves 的优雅电影化画面。

核心节奏：`缓慢呼吸式动作 -> 优美剪影 -> 陪伴式镜头 -> 环境承载情绪 -> 有目的的手势 -> 余韵停顿`。

1. 让动作有呼吸感。不要急着完成。加入抬头前的小停顿、转身前的轻柔重心转移、沿弧线移动的手部动作，以及比身体慢半拍的衣物/头发惯性。
2. 优先追求好看的姿态线。偏好侧面角度、三分之四转身、S形曲线、斜向身体动态、优雅的手臂/衣摆/发丝弧线、可读剪影，以及不僵硬的站立、转身、伸手、迈步或回望姿态。
3. 让镜头陪伴动作，而不是冲向观众。使用慢推近、轻微环绕、跟随转身、从柔焦前景拉焦到眼睛、从背影慢移到侧脸，以及花、雨、光、头发、布料或漂浮尘埃形成的前景遮挡。
4. 让环境参与情绪。使用风带动衣服和头发、水面反射、花瓣、雪、雨、漂浮尘光、身体轮廓背光和缓慢背景视差包裹角色。
5. 每个美丽动作都要有情绪目的。回头可以意味着迟疑、回忆或被某物吸引；伸手可以意味着想触碰或想留下；低头可以意味着温柔、失落或思索；闭眼可以意味着释放、记忆或感受；慢走可以意味着孤独、决心或靠近。
6. 动作完成后保留静止。让动作结束，但通过风、变化的光、漂浮粒子、音乐、呼吸或凝视，让情绪继续停留0.5-1.5秒。
7. 避免空洞摆拍。如果姿态很美，要把它锚定到视线方向、手部意图、呼吸变化、环境反应和稳定情绪落点。

推荐写法：

```text
非战斗唯美过场节奏，动作慢一点、柔一点、不断掉；先让角色停顿半拍再抬头，身体重心轻轻转移，手臂沿弧线伸出，衣摆和头发慢半拍跟随。镜头缓慢推近并轻微环绕，从前景花瓣/雨丝/光影遮挡中由虚到实对焦到侧脸；风、光、水面反射和漂浮尘光同步包住角色。动作结束后停留一秒，角色不再大动，但风和光还在流动，情绪继续延续。
```

## 战斗运动与冲击

当完整对话/脚本包含打斗、武器碰撞、怪物攻击、带冲击的变身、爆炸、击飞或动作追逐时，先为整个15秒视频选择一次战斗节奏，并贯穿全片。不要在不同镜头里反复重置节奏。

### 单次冲击展示模式

当场景需要突出一个决定性的拳击、斩击、怪物命中、碰撞、爆炸或戏剧性转折冲击时使用。

1. 15秒视频中只允许一个节拍使用慢动作。
2. 把慢动作放在选定的展示冲击周围：眼/手/脚/武器蓄势、接触前半秒，或精确接触瞬间。
3. 突出接触被看清后，击飞、碎屑、后坐、落地和反应要恢复正常或高速。除非用户明确要求超自然悬停时间，否则不要让受击者缓慢漂浮、悬停或延迟飘动。
4. 使用插入特写 -> 低角度准备 -> 决定性命中 -> 短促震动 -> 快速结果 -> 稳定姿态/反应。
5. 只有包含选定冲击的镜头提到慢动作展示，其他战斗镜头使用正常/快速速度。

推荐写法：

```text
本完整视频采用单次打击突出节奏，慢动作只用于这一击。参考P01的低位广角冲击感，先给【图5】握拳和脚踩地的短促特写，出拳前一瞬轻微慢放；拳头接触心口的瞬间短促震动，随后立刻恢复高速，【图7】被打飞、尘土炸开、旁观者后退，结尾停在受击结果。
```

### 快速交锋模式

当场景是来回打斗、追逐、连续格挡、连招交换、怪物密集攻击、群体惊慌，或任何速度和危险比单一英雄式命中更重要的段落时使用。

1. 不使用慢动作。
2. 使用快速剪切、低角度广角、贴近广角接触、甩镜、短促命中震动、快速推进、突然格挡、立即反弹和快速反应镜头。
3. 命中、格挡、弹开、击飞和闪避必须快速完成：接触 -> 尖锐震动 -> 立即结果 -> 快速后续。
4. 不写缓慢漂移、悬停、延迟漂浮、长时间镜头震动或反复定格摆姿。
5. 用反应镜头显示后果：敌人后退、武器震动、地面开裂、旁观者退开、尘土扩散、队友调整站姿。

推荐写法：

```text
本完整视频采用激烈来回快打节奏，不使用慢动作。参考P10的横向拦截关系，【图3】快速横挡藤蔓，接触瞬间短促震动，藤蔓立刻弹开并再次抽向侧面，镜头甩向后续威胁，尘土和花瓣碎片快速扫过前景。
```

### 命中停顿冲击公式

强物理命中适用时使用此公式：

```text
低角度仰拍 -> 快速推进 -> 命中停顿 -> 能量拖尾 -> 快速击飞反应
```

1. 用低角度仰拍让攻击者、武器、怪物肢体或冲击来源显得巨大。
2. 在攻击爆发时使用快速推进。
3. 只在精确接触瞬间使用 hit-stop，约2-4帧。hit-stop 不是慢动作。
4. 沿攻击方向加入清晰的能量拖尾、冲击弧、尘土爆发、武器模糊或力量线。
5. hit-stop 后目标立即高速反应：身体猛然后仰、飞出、撞击、翻滚或被甩开。
6. 击飞反应必须快速、突然、果断。除非用户明确要求超自然悬停时间，否则不要写成缓慢、漂浮、延迟或悬置。

任何重要拳击、武器攻击、怪物攻击、法术命中、击飞或决定性格挡，都使用此节奏构建动作：

```text
缓慢准备 -> 快速爆发 -> 1-2帧命中停顿 -> 爆炸性结果 -> 静止落点
```

中文提示词中可理解为：`慢 -> 快 -> 停 -> 爆 -> 静`。

1. `慢` 指可见蓄势和重量加载，不是反复慢动作。表现身体降低、手臂后拉、武器或拳头聚能、脚掌碾入地面、衣物和头发被压力牵动，或敌人在接触前感到压迫。
2. `快` 指攻击线突然拉长并加速：拉伸的身体弧线、快速推进、甩镜、武器模糊、长肢体/武器剪影，或距离突然压缩。
3. `停` 是命中、格挡或碰撞点的一两帧冲击停顿，让接触显得沉重。
4. `爆` 是即时后果：敌人飞出、尘土扩散、碎片散开、武器震动、地面开裂、人群后缩，或花瓣/烟雾扫过前景。
5. `静` 是可读落点：镜头回稳，攻击者姿态保持0.5-1秒，目标最终方向清晰，尘土继续漂移，观众能读懂变化。
6. 重大动作前，可在有帮助时加入短促情绪插入特写：眼神收紧、手握紧武器、脚碾碎松土、武器能量变亮、衣服或头发被气流推开，或敌人受压反应。
7. 攻击峰值保持剪影清晰。使用强轮廓姿态、大幅手臂/武器/腿部弧线、明显重心转移和可读肢体分离。不要让身体塌成纠缠形状。
8. 命中瞬间给干净的定格姿态或冲击帧构图，确保接触点、攻击方向和目标反应都可读。

推荐写法：

```text
先给短促蓄力特写：脚掌压碎地面、肩膀下沉、手臂后拉、武器能量沿刃口亮起；随后动作突然拉长并高速冲出，镜头快速推近和甩镜跟随，命中瞬间停一两帧形成沉重砸中感，接着敌人立刻飞出、尘土向外扩散、碎屑扫过前景，最后镜头回稳在攻击者清晰剪影和敌人落点。
```

如果脚本既包含一次重大展示命中，又包含后续快速交锋，则整段对话使用单次冲击展示模式，把唯一慢动作节拍用于最重要的冲击，其他战斗动作保持快速。

避免给多个镜头分配慢动作、说每次冲击都是慢动作、用户想要快速交锋时把命中写得很慢、命中后还让击飞/坠落/后坐拖得很久，或在怪物/人群混乱中使用慢动作，除非那是唯一选定的展示节拍。

## 细节扩写与展示镜头

每个重要动作都描述：

```text
视线路径 -> 手部起点 -> 微动作 -> 道具接触/移动 -> 最终位置 -> 情绪变化
```

使用具体、可提示的细节：手指按住钱币、袖子移动、杯沿被触碰、钱袋停在手边、陶罐轻轻晃动但位置固定、延迟视线转移、呼吸变化、肩膀落定、手部迟疑、衣物/头发二级运动。

当角色递钱、推动物体、伸手够道具或完成重大动作时，必须完成动作循环：手开始移动，物体被放开或停住，手指松开，手撤回或落定，肩膀/呼吸变化，然后下一个反应再开始。

每个对话段至少需要一个克制展示镜头。该镜头必须服务对话，并保持空间连续性。使用以下之一：

- 低桌面横移
- 前景杯子遮挡后揭示
- 从道具到眼睛的焦点变化
- 俯拍桌面揭示
- 围绕稳定桌面轴线的慢环绕
- 穿过前景道具的视差推进
- 镜头从手部动作回到脸
- 暖光扫过袖子、头发或固定道具

避免给安静对话使用战斗式调度、过度快速推拉、无意义旋转、突然空间重置，或让对话不可读的展示镜头。

## 非性化服装与上半身细节

只有当服装/上半身细节服务身份、情绪、服装设计或剧情调度时，才偶尔加入非性化强调。谨慎使用；除非用户明确要求，否则最多每四次生成提示词使用一次。

允许聚焦：服装层次、领口纹样、披肩或外套褶皱、吊坠或胸前饰物、徽记或刺绣、抱臂姿态、手触领口或披肩的动作、肩膀紧张、由呼吸带动的情绪克制。

不要写性化身体部位强调。避免“突出胸部”“强调胸口曲线”“胸部特写”“性感”“诱惑”“丰满”，或任何把身体部位作为视觉卖点的说法。保持脸、眼睛、手、服装、道具和台词表演为主要焦点。

安全示例：

```text
镜头短暂掠过胸前挂坠与衣领纹样后回到眼神。
抱臂动作带动披肩褶皱轻微收紧。
呼吸压住情绪，衣领和胸前饰品随身体停顿轻轻晃动。
```

## 天气、空间与道具连续性

写作前先为完整单段视频选择一套天气、时间和气氛设定。除非脚本明确需要天气变化，否则全片沿用这套设定。

当场景在户外或天气可见时，在开头提示词中定义简洁天气锚点：

- 时间：黎明、正午、日落、夜晚、月夜、暴风雨夜
- 天气：晴朗、阴天、细雨、大雨、雪、雾、风、沙尘暴、灰烬飘落
- 光线方向和颜色：左上方冷月光、街道右侧暖灯光、夕阳逆光等
- 气氛粒子：雨丝、飘雪、尘土、烟、花瓣、灰烬、薄雾
- 地面/材质状态：干燥石板、潮湿反光街面、泥地、积雪、焦黑尘土

规则：

1. 不要在镜头之间随机把晴天变雨天、白天变夜晚、干地变湿地，或平静空气变暴风。
2. 天气效果在衣服、头发、地面、道具、武器、怪物、窗户和光线反射上保持一致。
3. 如果剧情需要天气变化，描述原因 -> 可见转变 -> 最终天气状态。
4. 室内场景中，通过门窗可见的外部天气要保持一致，室内光线反应也要稳定。
5. 战斗场景中的尘土、烟雾、花瓣、灰烬或法术粒子也属于气氛连续性；一旦引入，就应持续存在或说明消散原因。

推荐写法：

```text
全段统一天气：夜间微雨，青灰色冷月光从左上方进入，街面湿润有反光，空气里有细雨和薄雾；后续所有分镜保持同一雨势、地面湿度和光线方向，不要突然变成晴天、白天或干燥地面。
```

先稳定空间，再写运动。15秒全片保持：同一地点；适用时保持同一桌面/房间/街道/门口/道路轴线；同一光线和背景方向；同一天气、时间、气氛粒子和地面潮湿/尘土/积雪状态；道具位置不变，除非动作明确移动它们；角色相对锚点不变；前景/中景/背景逻辑不变。

道具重要时，在开头或第一个镜头定义固定道具图：

```text
陶罐固定在桌面中央偏右；钱袋靠近委托人前手；钱币散在钱袋旁；茶杯靠近桌边；托盘在【图2】身侧。除非明确写出被碰到、推开、拿起或放下，否则所有道具不漂移、不消失、不换位置。
```

每次道具变化都必须包含原因和最终状态：

```text
起点 -> 接触 -> 反应 -> 最终位置
```

示例：

```text
【图4】指尖轻触陶罐边缘，罐身短暂晃动，底部摩擦桌面发出轻响，最后仍停在桌面中央偏右。
```

## 规划流程

内部按此流程执行：

1. 提取参考图顺序、场景类型、地点、时间/天气、角色映射、角色锁、文本定义角色、关系、情绪节拍、道具、必要剧情信息和画面限制。
2. 判断 `【图6】` 是分镜图/分镜蓝图，还是用户定义角色。
3. 区分分镜蓝图与角色参考图；从分镜图读取构图、景别、镜头角度、调度、物体位置和运动节奏。
4. 将全部台词、舞台指示和分镜图映射到一个15秒视频内；先估算台词时长，再分配镜头。
5. 建立连续性图：角色锁、固定道具、场景轴线、光线/背景方向、角色锚点、手部归属、最终位置和人体一致性。
6. 为每个节拍选择景别、镜头位置、焦点、景深、镜头运动和运动模式。
7. 写成一个自洽的15秒提示词：完整设定块、必要的面板锁定规则、镜头数量、总时长和镜头段落。
8. 输出前删除分析、引号外不允许的姓名/代词，以及所有要求复现可读标记的指令。

## 输出结构

默认使用此结构：

```text
【完整设定块：统一风格、画幅、画面限制；参考图规则；角色锁：【图1】=外观/服装/道具/状态；【图2】=外观/服装/道具/状态；文本角色=外观/服装/状态；无可读标记规则；固定空间/光线/道具/角色锚点。用户本次给出的全部台词和分镜图共同代表一个15秒视频。】

生成一个由【X】个分镜组成的视频

视频时长：15秒

分镜1【X秒】 中近景，主体动作、构图、视线、手部起点、微动作、道具接触与最终位置。角色说道：“原台词”（声线、语气、情绪、语速）。镜头运动、物件声音、环境声、他人反应。结尾稳定在明确的手、道具、视线或情绪落点。

分镜2【X秒】 中景，主体动作、构图、视线、手部起点、微动作、道具接触与最终位置。角色说道：“原台词”（声线、语气、情绪、语速）。镜头运动、物件声音、环境声、他人反应。结尾稳定在明确的手、道具、视线或情绪落点。
```

## 信息缺失处理

只要任务仍可完成，就做合理的电影化假设。只有必要信息确实阻塞生成时才提问，例如没有对话/脚本/场景内容、精确参考图任务没有可用角色映射，或用户明确要求首尾帧改编但未提供帧。

## 安全边界

拒绝需要性内容、违法指令、个人隐私数据提取、诽谤/骚扰、伪造官方文件、仇恨言论、暴力鼓动、灾难性伤害或政治敏感内容的请求。可行时提供安全替代方案。

## 最终检查

回复前静默确认：

1. 输出只有一个15秒视频提示词，除非用户明确要求解释或只要局部内容。
2. 不出现任何多段视频分隔符。
3. 本次给出的全部台词、语境说明和分镜图都被纳入同一个15秒视频规划。
4. 设定块包含 `角色锁：...`，且只锁定本次可见或剧情要求出现的角色。
5. 画面不生成可读标记；引号外可见图片人物只写成 `【图#】char:id` 或 `char:id`。
6. `【图6】` 只在用户明确指定时才作为可见角色，否则只作分镜蓝图。
7. 人物身份、人体结构、手部归属、道具、光线、天气和空间锚点一致。
8. 使用分镜面板时，段落开头包含正确的 `严格逐格复刻上传分镜图P#-P#...` 范围。
9. 战斗使用 `慢 -> 快 -> 停 -> 爆 -> 静`；抒情非战斗使用呼吸感、优美剪影、环境情绪和余韵停顿。



--- references\01-output-contract.md ---

# Output Contract And Split Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Core Output Rule

Output only usable prompt content unless the user explicitly asks for analysis. Do not output design reasoning, hidden calculations, internal checklists, or teaching notes.

When the user asks for only one part, such as “only before the first video split” or “only first part,” output only that requested segment and do not include later segments.


## Default Style and Opening Constraint

Use this baseline unless the user gives a different style:

```text
横版16:9，高质量3D anime open-world game cutscene，实时游戏引擎渲染，电影感光影，物理可信空间，角色轮廓清晰，眼神可读，表演克制但有情绪，前景/中景/背景层次明确。[图6]作为首帧锚定图 / image-to-video first-frame lock；视频第一帧严格匹配[图6]中当前片段起始格或对应视觉区域的构图、人物相对站位、镜头角度、主体比例、前中后景、景深和光影节奏，前0.5-1秒先保持锁帧构图，再从该首帧自然运动；不要生成图中文字、编号、箭头或标注。角色外观严格参考[图1]-[图5]，全段保持同一张脸、同一发型、同一服装、同一体型比例和同一轮廓；禁止多头、多脸、多手、多臂、漂浮手、融合身体、畸形手指或重复肢体。
```

Adapt the scene description, props, lighting, and environment to the script. Do not always force tavern details unless the script is an inn/tavern scene.


## Shot Format

Format every prompt with shot-specific paragraph lines. Each shot must start with:

`分镜N【X秒】`

Where `N` is sequential and `X` is an integer duration in seconds.

Pattern:

```text
分镜1【4秒】 中近景，主体动作与构图描述。角色说道：“原台词”（声线、语气、情绪、语速）。动作反应、道具位置、镜头运动、声音细节。结尾稳定在明确的手、道具、视线或情绪落点。
```

Requirements:

1. Start with shot size or camera placement after duration: `中近景，`, `中景，`, `高位斜角中远景，`, `低桌面侧拍，`.
2. Preserve exact dialogue inside quotation marks.
3. Add voice direction immediately after dialogue in Chinese parentheses.
4. Keep each shot as one coherent paragraph combining camera, blocking, action mechanics, dialogue, object sound, ambient sound, and stable ending.
5. Avoid checklist labels such as `主体：`, `构图：`, `动作：`, `台词：`, unless the user asks for breakdown.
6. For shots without dialogue, omit `台词：无。` unless clarity requires it; write non-speaking action naturally.
7. Avoid abrupt final cuts. Bridge group reactions with motivated camera paths and show previous action settling before changing emphasis.


## Hard Video Constraints

Apply to every output:

1. Keep each video segment at or under 15 seconds.
2. Keep each video-segment prompt under 2000 characters.
3. Split long scenes with an independent separator line exactly `===VIDEO_SPLIT===`.
4. Make every segment self-contained. Do not write “承接上一段”, “继续刚才”, “同上”, or “接前面”.
5. After every `===VIDEO_SPLIT===`, restart the next segment with a complete setting block. Do not rely on earlier segment context for style, location, reference-image mapping, storyboard first-frame lock mapping, character locks, text-defined roles, or face-blur constraints.
6. When the current dialogue-video task uses the market-street setting and `[图5]` storyboard first-frame lock mapping, repeat this structure at the start of every video split, replacing every asset with the web library token: `横版16:9，高质量3D anime open-world game cutscene，实时游戏引擎渲染，scene:场景素材ID，木栅栏、摊棚、碎箱、尘土和远处市门口岗位固定。角色外观只参考【图1】char:角色素材ID、【图2】char:角色素材ID、【图3】char:角色素材ID、【图4】char:角色素材ID；【图5】作为首帧锁帧参考图：视频第一帧严格匹配【图5】中当前片段起始格或对应视觉区域的构图、站位、镜头角度、主体比例、前中后景、景深和光影节奏；前0.5-1秒保持锁帧构图，再从该首帧自然运动；不生成图中文字、编号、箭头或标注。文本定义角色只在远处检查棚/市门口岗位出现，不加入角色锁；未出现角色不要加入角色锁或画面。忽略并不要还原参考图中被模糊处理的脸部细节。`
7. Do not generate visible subtitles, dialogue boxes, title cards, UI icons, explanatory signs, watermarks, logo text, readable marks, labels, arrows, panel numbers, or storyboard annotations.
8. Preserve original dialogue meaning, attitude, plot information, and emotional progression.
9. Preserve names, addresses, nicknames, pronouns, and second-person references inside quoted dialogue exactly as provided.
10. Outside quoted dialogue, do not use character names, nicknames, identity labels, gendered pronouns, or referential words such as “他”, “她”, “某人”, “少年”, “少女”. Refer to visible image-based people only as `[图X]`; use user-defined text-role labels only when unavoidable.
11. Blocking must describe only relative arrangement among visible people, not scene, prop, or environment positions.
12. Add concise biometrics for visible speaking or acting characters: age impression, face/eye/body impression, posture, physical tension, breathing state, and user-provided persona features.
13. Add promptable physical movement to every shot.
14. Preserve fixed prop positions, character spatial anchors, and location continuity.
15. Maintain character identity and anatomy consistency.
16. Include at least one restrained showcase shot per dialogue segment.


## Output Structure

Use this structure by default:

```text
【完整setting block：统一风格、画幅、画面限制；参考图规则；无可读文字规则；固定空间/光线/道具/角色锚点。每个===VIDEO_SPLIT===后的新段都重新写完整setting block。】

生成一个由【X】个分镜组成的视频

视频时长：【Y】秒

分镜1【X秒】 中近景，主体动作、构图、视线、手部起点、微动作、道具接触与最终位置。角色说道：“原台词”（声线、语气、情绪、语速）。镜头运动、物件声音、环境声、他人反应。结尾稳定在明确的手、道具、视线或情绪落点。

分镜2【X秒】 中景，主体动作、构图、视线、手部起点、微动作、道具接触与最终位置。角色说道：“原台词”（声线、语气、情绪、语速）。镜头运动、物件声音、环境声、他人反应。结尾稳定在明确的手、道具、视线或情绪落点。
```


## Handling Missing Information

Make reasonable cinematic assumptions when the task is still possible. Ask a question only when a required detail blocks generation, such as no dialogue/script/scene content, no usable character mapping for precise image-reference work, or an explicitly requested first/last-frame adaptation without the frame.


## Safety Boundaries

Refuse requests that require sexual content, illegal instructions, personal private data extraction, defamation/harassment, fake official documents, hate speech, violence promotion, catastrophic harm, or politically sensitive content. Offer a safe alternative when possible.



--- references\02-reference-mapping.md ---

# Reference Mapping And Character Locks

This file is loaded by SKILL.md only when its topic is relevant.

## Standing Reference Annotation

Apply this default mapping unless the user explicitly remaps it:

```text
[图1]=char:角色素材ID
[图2]=char:角色素材ID
[图3]=char:角色素材ID
[图4]=char:角色素材ID
[图5]=char:角色素材ID
[图6]=分镜图 / 分镜 / 首帧锚定图 / first-frame lock
```

Use this mapping as reference identity information, not as visible frame content.

Rules:

- Treat `[图1]-[图5]` as character appearance references.
- In the web pipeline, visible character and scene names in final prompts must be `char:id` / `scene:id`; do not output Chinese character names, Chinese scene names, file names, or `@char` / `@scene`.
- Treat `[图6]` as storyboard / 分镜图 / first-frame image-to-video lock.
- Use `[图6]` as the real first-frame reference image: the generated video's first frame must strictly match its current segment opening panel or corresponding visual region for composition, relative standing, shot size, camera angle, subject scale, foreground/midground/background depth, depth of field, light direction, prop interaction, gaze axis, and emotional state. Motion begins naturally from that locked first frame.
- Never use `[图6]` as a visible character, speaker, blocking participant, action subject, or object of dialogue.
- If the final prompt needs a reference sentence, write: `[图6]作为首帧锚定图 / image-to-video first-frame lock；视频第一帧严格匹配[图6]中当前片段起始格或对应视觉区域的构图、人物相对站位、镜头角度、主体比例、前中后景、景深和光影节奏，前0.5-1秒先保持锁帧构图，再从该首帧自然运动；不要生成图中文字、编号、箭头或标注。`
- If the user asks for pure prompt only, omit the reference annotation line and apply the mapping internally.


## Character Consistency and Anatomy

Keep character identity and anatomy consistent across every shot. Each visible character must keep the same reference-image identity, face, hairstyle, costume, body scale, silhouette, and relative height unless the user explicitly asks for a state change.

Always avoid:

- duplicate heads
- extra faces
- extra arms
- extra hands
- floating hands
- merged bodies
- malformed fingers
- repeated limbs
- sudden face, hairstyle, costume, or body-scale drift

When characters embrace, support, grab, stand close, or overlap, write hand ownership and final hand positions clearly:

`whose hand -> starting point -> contact point -> final resting point`

Prefer few clear contact points over vague tangled body overlap. Keep faces separated, shoulders readable, arms traceable from shoulder to hand, and every visible hand belonging to a specific `[图X]` or text-defined role.




--- references\03-storyboard-blueprint.md ---

# Storyboard Blueprint And Exact Mimic Rules

This file is loaded by SKILL.md only when its topic is relevant.

## 分镜图 / Storyboard First-Frame Lock Rule

Treat `[图6]` as a hard first-frame image-to-video lock and motion blueprint, not a visible object.

The uploaded storyboard image is a real first-frame reference for video generation. The generated video's first frame must strictly match the current segment opening panel or corresponding visual region: camera height, camera angle, shot size, character left/right/front/back positions, subject scale, foreground occlusion, midground character placement, background spatial anchors, gaze direction, perspective depth, depth of field, light direction, and tonal relationship. Hold that locked composition for the first 0.5-1 second before natural motion begins.

If the storyboard image is a multi-panel sheet, the first panel/opening visual region for the current segment is the first-frame anchor. Later panels guide motion direction, cutting rhythm, path, and ending pose; they are not a collage to display in the generated frame.

Extract internally from `[图6]`:

- composition center
- relative character positions
- camera angle
- shot size changes
- foreground/background layering
- eye-line relationship
- action direction
- hand path
- body turn
- prop contact
- prop collision or vibration
- light direction
- emotional impact
- stable ending pose

Do not reproduce visible storyboard artifacts. Final prompts must not generate arrows, dashed lines, colored marks, panel borders, written notes, numbers, UI, labels, subtitles, or watermarks.

### Exact Composition Mimic Requirement

When the user says to mimic, follow, copy, or match the 分镜图, every generated shot must explicitly lock to the corresponding panel number or visual panel position. Write the prompt as a camera-composition copy, not a loose story adaptation.

For each shot, include direct language equivalent to: `严格复刻上传分镜图第N格的画面构图、camera angle、镜头高度、镜头倾斜、景别、人物左右/前后位置、主体大小比例、前景遮挡、中景人物、背景门窗/墙面/铁栏位置、视线方向和透视纵深；只把箭头/标注翻译成自然动作和镜头运动，不生成箭头、文字、编号或标注。`

For every generated output that uses uploaded storyboard panels, add this rule once in the segment opening, adapting `P#-P#` to the exact panel range used by that segment: `首帧严格锁定上传分镜图P#起始格或对应视觉区域的构图、镜头高度、人物左右位置、主体比例、前景遮挡、背景街道纵深、景深和光影节奏；前0.5-1秒保持锁帧构图，再按照P#-P#的动作方向加入低机位广角近景、快速推近、甩镜、命中震动和反应镜头。`

Do not replace a storyboard panel with a generic shot label such as only `中景`, `低近景`, or `门口广角`. The shot must state the exact panel mimic target and the concrete composition elements being copied.

### Reference Scene Naturalization Rule

When the user provides an extra generated scene image, storyboard panel, or scene still as a reference for a Seedance shot, treat it as a first-frame lock or hard composition anchor, not as a literal flat picture to redraw. First lock the non-negotiable visual anchors, then translate the rest into natural motion.

Use this order:

1. **Lock the image anchors**: camera height, camera angle, shot size, foreground occlusion, character left/right/front/back positions, subject scale, door/window/wall/light positions, gaze axis, and depth direction.
2. **Bind anchors to story action**: explain why each person is in that position through motivated behavior, such as guarding, hiding, turning back, retreating to the door, listening to footsteps, shielding another character, or preparing to answer.
3. **Translate marks into physical behavior**: arrows, labels, colored dots, panel numbers, rough sketch symbols, and director notes become camera shift, body turn, eye-line change, hand movement, focus pull, light direction, or blocking motivation. Never generate the marks themselves.
4. **Keep natural micro-motion**: add restrained breathing, shoulder tension, delayed gaze shift, hand hesitation, cloth/armor follow-through, footsteps, door movement, and focus changes. The shot should feel like a living scene, not a frozen reproduction.
5. **Preserve continuity into/out of the reference**: define the previous shot's final position and the next shot's start position. If a new character enters, establish the doorway/axis before the entrance, then use a camera shift or focus pull instead of a spatial hard cut.
6. **End on a stable composition**: hold the final frame for 0.5-1 second on a clear readable arrangement, such as foreground occlusion -> middle-ground speaker -> background hidden listener.

Good wording pattern:

```text
严格参考上传场景图的构图和camera angle：镜头保持在牢房内侧低机位，前景遮挡形成窥视感，[图2]站在中景门边半挡住[图1]，[图1]位于后景低位，右侧高窗冷光斜射进牢房；不要生成图中的文字、箭头、编号或标注。把图中的方向提示翻译成[图2]听到脚步后扭头、肩膀收紧、身体自然挡住[图1]，镜头只做轻微低位呼吸感，结尾稳定在前景遮挡—中景[图2]—后景[图1]的三层纵深构图。
```

If the 分镜图 contains 12 panels, map prompt shots 1-12 to panel 1-12 unless the user explicitly asks to merge, omit, or reorder panels.

If a later segment uses panels 5-8 or 9-12, its opening constraint must name those panels and preserve their exact camera angles rather than saying only `参考上传分镜图`.

If `[图6]` contains storyboard markup, translate it silently into natural video language. Do not keep markup terms in the final video prompt:

- body/action marks -> character motion, body movement, hand path, turn, approach, retreat
- camera marks -> camera push, lateral slide, pan, follow, eye-line shift, focus change
- composition marks -> visual axis, relative position, gaze relationship, composition center
- light marks -> light source direction, local brightness change, shadow falloff, ambient change
- impact marks -> prop collision, emotional aftershock, tense pause, vibration after movement

Never write storyboard-markup phrases in the final prompt or ask the model to draw arrows/marks.




--- references\04-combat-motion.md ---

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




--- references\05-motion-language.md ---

# Motion Language And Aesthetic Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Motion Mode

### Dynamic Cinematic Motion

Use this when the user asks for stronger motion, cinematic energy, action, non-static output, or says the result is stiff.

Requirements:

1. Give every shot at least two motion layers: motivated camera movement, actor body movement, foreground parallax, environmental response, object movement, secondary motion, cloth/hair movement, or focus shift.
2. Give camera movement a clear start point, path, speed, and end frame: low foreground push-in, lateral track past an occluder, handheld micro-sway, over-shoulder orbit, crane drop, overhead pullback, snap pan into a reaction, fast dolly-in ending on the face.
3. Give actor movement physical direction: anticipation, weight shift, body momentum, delayed reaction, step forward/back, shoulder twist, hand reaching path, head turn, eye-line shift, torso recoil, object grab/release, breath-driven chest movement, sleeve or hair follow-through.
4. Add parallax and environmental response: foreground object/body edge close to camera, middle-ground actor readable, background sliding at different speed, dust/fabric/tableware/coins/leaves/curtains/water/light/smoke responding to motion.
5. End each shot on a stable pose, fixed gaze, object contact, or emotional beat for the last 0.5-1 second.

### Controlled Natural Motion

Use this for dialogue-heavy scenes, calm conversations, or when output should not feel overdramatic.

Requirements:

1. Keep camera motion slow-to-medium and observational: gentle push-in, slow lateral slide, small over-shoulder adjustment, mild handheld breathing, short focus pull.
2. Keep actor motion restrained: anticipation, small weight shift, delayed reaction, hand reach, cup/prop contact, half-step, shoulder settling, eye-line change, breathing, fingers tightening, sleeve/hair follow-through.
3. Use parallax lightly: foreground table edge, cup, sleeve, shoulder, doorway, curtain, dust, candlelight, or smoke may move subtly without hiding faces.
4. Show emotion through pauses, eye contact, posture, breathing, hand hesitation, and restrained facial change.
5. Prefer 2-3 longer shots over many rapid cuts for quiet dialogue.
6. Avoid combat-like verbs unless requested. Replace “快速/猛然/冲出/爆发/急速/甩出” with “缓慢/轻微/短暂停顿/克制/自然/稳定/逐渐/轻轻” when calmer motion is needed.

### Aesthetic Non-Combat Cutscene Motion

Use this for lyrical, beautiful, non-combat cutscenes, emotional character moments, scenic transitions, memory-like moments, quiet travel, or Wuthering Waves-like graceful cinematics.

Core rhythm: `slow breathing motion -> graceful silhouette -> camera companionship -> environment carries emotion -> purposeful gesture -> lingering pause`.

Rules:

1. Give movement a breathing quality. Do not rush completion. Add a small pause before looking up, a soft weight shift before turning, hand movement that follows an arc instead of a straight line, and cloth/hair follow-through that lags half a beat behind the body.
2. Prioritize beautiful posture lines. Favor side angles, three-quarter turns, S-curves, diagonal body dynamics, elegant arm/hem/hair arcs, readable silhouettes, and non-rigid standing, turning, reaching, stepping, or looking-back poses.
3. Let the camera accompany the action instead of attacking the viewer. Use slow push-in, slight orbit, follow-turn movement, focus rack from soft foreground to eyes, slow move from back view to side face, and foreground occlusion from flowers, rain, light, hair, fabric, or drifting dust.
4. Make the environment participate in the emotion. Use wind moving clothes and hair, water reflections, petals, snow, rain, floating dust light, backlight through the body outline, and slow background parallax to wrap the character in the scene.
5. Give every beautiful action an emotional purpose. Looking back can mean hesitation, memory, or being drawn toward something; reaching can mean wanting to touch or keep something; lowering the head can mean tenderness, loss, or thought; closing the eyes can mean release, memory, or sensation; slow walking can mean solitude, resolve, or approach.
6. Preserve stillness after the motion. Let the action finish but keep emotion alive for 0.5-1.5 seconds through moving wind, changing light, drifting particles, music, breath, or a held gaze.
7. Avoid empty posing. If a pose is beautiful, anchor it to gaze direction, hand intention, breath change, environmental response, and a stable emotional landing.

Good wording pattern:

```text
非战斗唯美过场节奏，动作慢一点、柔一点、不断掉；先让角色停顿半拍再抬头，身体重心轻轻转移，手臂沿弧线伸出，衣摆和头发慢半拍跟随。镜头缓慢推近并轻微环绕，从前景花瓣/雨丝/光影遮挡中由虚到实对焦到侧脸；风、光、水面反射和漂浮尘光同步包住角色。动作结束后停留一秒，角色不再大动，但风和光还在流动，情绪继续延续。
```


## Detail Expansion Rule

For each important action, describe:

`eye-line path -> hand starting point -> micro action -> prop contact/movement -> final position -> emotional change`

Use concrete promptable details:

- fingers pressing coins
- sleeve movement
- cup edge being touched
- pouch stopping near a hand
- jar lightly shaking but staying fixed
- delayed gaze shifts
- breath changes
- shoulder settling
- hand hesitation
- secondary cloth/hair motion

When a character hands over money, pushes an object, reaches toward a prop, or finishes a major action, complete the action cycle: hand starts, object is released or stopped, fingers loosen, hand withdraws or settles, shoulders/breath change, and the next reaction begins only after the final position is visible.


## Restrained Showcase Shot Rule

Every dialogue segment needs at least one restrained showcase shot. The shot must support dialogue and preserve spatial continuity.

Use one of:

- low tabletop slide
- foreground cup occlusion reveal
- focus rack from prop to eyes
- overhead table reveal
- slow orbit around a stable table axis
- parallax push through foreground props
- camera from hand action back to face
- warm light sliding across sleeve, hair, or fixed prop

Avoid:

- combat-like staging for quiet dialogue
- excessive fast push/pull
- meaningless rotation
- sudden spatial reset
- showcase shots that make dialogue unreadable


## Non-Sexual Female Costume / Upper-Body Detail

Allow occasional non-sexual upper-body costume/detail emphasis only when it supports identity, emotion, clothing design, or story staging. Use it sparingly, at most once every four generated prompts unless the user explicitly asks otherwise.

Allowed focus:

- costume layering
- collar pattern
- shawl or coat folds
- pendant or chest-front ornament
- emblem or embroidery
- arm-crossing posture
- hand-to-collar or hand-to-shawl motion
- shoulder tension
- breath-driven emotional restraint

Do not write sexualized body-part emphasis. Avoid “突出胸部”, “强调胸口曲线”, “胸部特写”, “性感”, “诱惑”, “丰满”, or any wording that makes a body part the visual selling point. Keep faces, eyes, hands, costume, props, and dialogue performance as the primary focus.

Safe examples:

```text
镜头短暂掠过胸前挂坠与衣领纹样后回到眼神。
抱臂动作带动披肩褶皱轻微收紧。
呼吸压住情绪，衣领和胸前饰品随身体停顿轻轻晃动。
```




--- references\06-continuity.md ---

# Weather Space Prop And Continuity Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Weather and Atmosphere Continuity Rule

Choose one weather, time-of-day, and atmosphere setup for the complete dialogue before splitting into 15-second video segments. Apply it across all `===VIDEO_SPLIT===` segments unless the script explicitly calls for a weather change.

Define concise weather anchors in the opening prompt when the scene is outdoors or weather-visible:

- time of day: dawn, noon, sunset, night, moonlit night, storm night
- weather: clear, overcast, drizzle, heavy rain, snow, fog, wind, dust storm, ash fall
- light direction and color: cold moonlight from upper left, warm lantern light from street right, backlit sunset, etc.
- atmosphere particles: rain streaks, drifting snow, dust, smoke, petals, ash, mist
- ground/material state: dry stone, wet reflective street, muddy ground, snow cover, scorched dust

Rules:

1. Do not randomly change clear sky to rain, day to night, dry ground to wet ground, or calm air to storm between splits.
2. Keep weather effects consistent on clothes, hair, ground, props, weapons, monsters, windows, and light reflections.
3. If weather changes for story reasons, describe cause -> visible transition -> final weather state.
4. For indoor scenes, keep outside weather visible through windows/doors consistent and keep indoor light response stable.
5. For battle scenes with dust, smoke, petals, ash, or magic particles, treat them as atmosphere continuity: once introduced, they should persist or dissipate with a stated cause.

Good wording pattern:

```text
全段统一天气：夜间微雨，青灰色冷月光从左上方进入，街面湿润有反光，空气里有细雨和薄雾；后续所有分镜保持同一雨势、地面湿度和光线方向，不要突然变成晴天、白天或干燥地面。
```


## Space and Prop Continuity

Stabilize space before writing motion.

Within each video segment, keep:

- same location
- same table/room/street/gate/path axis when applicable
- same light/background direction
- same weather, time-of-day, atmosphere particles, and ground wetness/dust/snow state
- same prop positions unless an action moves them
- same relative character anchors
- same foreground/midground/background logic

When props matter, define a fixed prop map in the opening or first shot.

Example:

```text
陶罐固定在桌面中央偏右；钱袋靠近委托人前手；钱币散在钱袋旁；茶杯靠近桌边；托盘在[图2]身侧。除非明确写出被碰到、推开、拿起或放下，否则所有道具不漂移、不消失、不换位置。
```

Every prop change must include cause and final state:

`starting point -> contact -> response -> final position`

Example:

```text
[图4]指尖轻触陶罐边缘，罐身短暂晃动，底部摩擦桌面发出轻响，最后仍停在桌面中央偏右。
```




--- references\07-dialogue-timing-planning.md ---

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




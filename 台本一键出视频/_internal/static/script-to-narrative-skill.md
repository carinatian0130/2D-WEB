---
name: script-to-narrative
description: 台本→剧本。读完整台本表格（Text Window + Context Description + Character），输出一段 detailed writing：台词融入动作，补充物理细节、感官层和空间关系，行与行之间桥接为连续叙事，每段末尾加一句跨段衔接。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [台本, 剧本, 叙事, pipeline]
    related_skills: [script-segmenter, script-backbone-compact]
---

# 台本→剧本

## 概述

Pipeline 第一步。读完整台本表格（三列：Text Window + Context Description + Character），理解全貌后输出一段 detailed writing。

## 转化方法

1. **三列合并** — 谁 + 说什么 + 语境动作，合并成一个连续动作描写
2. **补物理细节** — 语境暗示但未写的：重心转移、呼吸变化、视线方向、接触点质感、衣物惯性
3. **串行动线** — 行与行之间用「随即」「趁」「与此同时」桥接，不跳跃
4. **补感官层** — 声音（炸开/闷响/震动）、光线变化、触感（碾入/擦过）
5. **逻辑一致性** — 持道具不架攻击、站位对应角色功能、动作不物理矛盾
6. **节奏控制** — 紧张处短句快切，呼吸处句子拉长，结尾留余韵

## 输出要求

- 台词融入动作描写，不单独列对白
- 用段落自然分节，不加镜头编号或分镜术语
- 覆盖全部表格行，不遗漏任何语境/动作/QTE
- 每段末尾加一句跨段衔接——简短暗示下一段的第一个事件
- 只输出剧本，不输出分析、解释或下一步指引

## 常见陷阱

1. 对白独立成段 → 禁止。台词必须融入动作。"「危险！」小星的声音紧绷"可以，"小星说：「危险！」"禁止。
2. 行间跳跃 → 禁止。每两行之间必须有桥接词或承接动作。
3. 遗漏语境 → Context Description 列写了的内容不能跳过。
4. 道具与动作矛盾 → 持罐子不架攻击、持长枪不翻滚。

## Web 工具集成

本 skill 已集成到用户的「台本一键出视频」web 工具中（`localhost:5000` 制片流水线 → 01 台本 → 「AI 生成剧本」折叠卡片）。调用 `/api/breakdown-script/stream`，skill prompt 嵌入 `instruction` 字段。详见 `references/web-tool-integration.md`。
/**
 * 配置表：助手文本匹配规则 → 优先尝试的动作组名（按顺序与模型 capabilities 求交）。
 * 组名需与 model3.json 里 `FileReferences.Motions` 的 key 一致（常见：Idle、TapBody、Flick…）。
 *
 * 示例（model3.json 片段，实际以模型为准；App 从该结构解析出 motions 列表）：
 * ```json
 * "FileReferences": {
 *   "Motions": {
 *     "Idle": [{ "File": "motions/idle.motion3.json" }],
 *     "TapBody": [{ "File": "motions/tap.motion3.json" }]
 *   }
 * }
 * ```
 */
export type IntentRule = {
  /** 说明，便于对照模型动作列表调试 */
  label: string;
  match: RegExp;
  /** 按优先级尝试；第一个在模型中存在的组即选用 */
  preferredMotionGroups: string[];
};

export const ASSISTANT_TEXT_INTENT_RULES: IntentRule[] = [
  {
    label: '开心/笑',
    match: /哈哈|呵呵|😄|😆|开心|高兴|好耶|太好了|不错|棒|赞/u,
    preferredMotionGroups: ['TapBody', 'Flick', 'Tap'],
  },
  {
    label: '惊讶/疑问',
    match: /[!？?]{2,}|哇|什么|居然|真的吗|不会吧|离谱|震惊/u,
    preferredMotionGroups: ['Flick', 'TapBody', 'Tap'],
  },
  {
    label: '道歉/难过',
    match: /抱歉|对不起|难过|伤心|遗憾|失败|错了|不好意思/u,
    preferredMotionGroups: ['TapBody', 'Idle'],
  },
  {
    label: '感谢/告别',
    match: /谢谢|感谢|再见|拜拜|晚安|辛苦了/u,
    preferredMotionGroups: ['Flick', 'TapBody', 'Idle'],
  },
  {
    label: '思考/说明',
    match: /因为|所以|首先|其次|总结|也就是说|简单来说|步骤/u,
    preferredMotionGroups: ['Idle', 'TapBody'],
  },
];

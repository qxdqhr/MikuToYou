/** 当前模型在 model3.json 中声明的一组动作（含条数） */
export type MotionCapability = {
  group: string;
  count: number;
};

/** 下发给 Live2D 执行层（如 WebView inject）的播放指令 */
export type AvatarMotionCommand = {
  kind: 'motion';
  group: string;
  index: number;
};

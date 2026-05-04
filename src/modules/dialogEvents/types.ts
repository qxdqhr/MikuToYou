/**
 * 应用级对话相关事件（与 LLM HTTP、Live2D 渲染解耦）。
 * 其它模块可订阅以实现「即插即用」行为。
 */
export type DialogEvent = {
  type: 'chat.assistant.completed';
  payload: {
    text: string;
    messageId: string;
  };
};

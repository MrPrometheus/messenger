import { useReducer } from 'react';

export enum IMessageType {
  Bot = 'BOT',
  User = 'USER'
}

interface IMessage {
  type: IMessageType;
  content: string;
}

interface IStateType {
  messages: { [key: number]: IMessage };
  currentMessage: string;
  lastMessageIndex: number;
}

type ActionKind = 'ADD' | 'NEW_LINE';

interface AddActionType {
  type: 'ADD';
  message: IMessage;
}

interface NewLineActionType {
  type: 'NEW_LINE';
}

interface IActionType {
  type: ActionKind;
  payload: AddActionType | NewLineActionType;
}

const initialStateMessages: IStateType = {
  messages: {},
  currentMessage: '',
  lastMessageIndex: 0
};

const reducerMessages = (state: IStateType, action: IActionType) => {
  const { type, payload } = action;

  switch (type) {
    case 'ADD': {
      if (payload.type === 'ADD') {
        const message = {
          type: payload.message.type,
          content:
            (state.messages[state.lastMessageIndex]?.content ?? '') +
            payload.message.content
        };
        return {
          ...state,
          messages: { ...state.messages, [state.lastMessageIndex]: message }
        };
      }
      return state;
    }
    case 'NEW_LINE': {
      if (payload.type === 'NEW_LINE') {
        return { ...state, lastMessageIndex: state.lastMessageIndex + 1 };
      }
      return state;
    }
    default:
      return state;
  }
};

export const useMessages = () => {
  return useReducer(reducerMessages, initialStateMessages);
};

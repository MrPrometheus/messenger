import { useEffect, useRef, useState } from 'react';
import styles from './Messanger.module.scss';
import { ReactComponent as SendIcon } from '../../assets/sendIcon.svg';
import { ReactComponent as BotIcon } from '../../assets/botIcon.svg';
import { ReactComponent as UserIcon } from '../../assets/userIcon.svg';
import { IMessageType, useMessages } from './hooks/Messages.hook';
import cn from 'classnames';

const decodeChunk = (chunk: string) => {
  let resultString = '';
  let index = 0;
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === '}') {
      const obj = JSON.parse(chunk.substring(index, i + 1));
      if (obj.status === 'content') resultString += obj.value;
      index = i + 1;
    }
  }
  return [resultString, chunk.substring(index)] as const;
};

export const Messanger = () => {
  const [inputValue, setInputValue] = useState<string>('');

  const refMessageContainer = useRef<HTMLDivElement>(null);

  const [showStopBtn, setShowStopBtn] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const [state, dispatch] = useMessages();

  const controller = useRef<AbortController>();

  useEffect(() => {
    if (refMessageContainer.current)
      refMessageContainer.current.scrollTop =
        refMessageContainer.current.scrollHeight;
  }, [state.messages]);

  const sendMessage = async () => {
    if (!inputValue) return;
    setInputValue('');
    dispatch({
      type: 'ADD',
      payload: {
        type: 'ADD',
        message: { content: inputValue, type: IMessageType.User }
      }
    });
    dispatch({
      type: 'NEW_LINE',
      payload: {
        type: 'NEW_LINE'
      }
    });

    if (controller.current?.signal.aborted || !controller.current) {
      controller.current = new AbortController();
    }

    setIsloading(true);

    const response = await fetch(
      'http://185.46.8.130/api/v1/chat/send-message',
      {
        body: JSON.stringify({ message: inputValue }),
        method: 'POST',
        signal: controller.current?.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    setShowStopBtn(true);

    if (!response.ok || !response.body) {
      throw response.statusText;
    }

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    let remainder = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        dispatch({
          type: 'NEW_LINE',
          payload: {
            type: 'NEW_LINE'
          }
        });
        setShowStopBtn(false);
        break;
      }

      setIsloading(false);
      const [resDecode, rem] = decodeChunk(remainder + value);
      remainder = rem;

      dispatch({
        type: 'ADD',
        payload: {
          type: 'ADD',
          message: { content: resDecode, type: IMessageType.Bot }
        }
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer} ref={refMessageContainer}>
        {Object.keys(state.messages).map((item, index, arr) => {
          const obj = state.messages[index];
          return (
            <div
              key={item}
              className={cn(styles.textContainer, {
                [styles.userTextContainer]: obj.type === IMessageType.User
              })}
            >
              {obj.type === IMessageType.User && <UserIcon />}
              {obj.type === IMessageType.Bot && <BotIcon />}
              <div className={styles.messageTextContainer}>
                {obj.type === IMessageType.Bot &&
                  index === arr.length - 1 &&
                  showStopBtn && (
                    <button
                      onClick={() => {
                        controller.current?.abort();
                        setShowStopBtn(false);
                        dispatch({
                          type: 'NEW_LINE',
                          payload: {
                            type: 'NEW_LINE'
                          }
                        });
                      }}
                    >
                      остановить
                    </button>
                  )}
                <div
                  className={cn(styles.text, {
                    [styles.textUser]: obj.type === IMessageType.User
                  })}
                >
                  {obj.content}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonText} />
          </div>
        )}
      </div>
      <div className={styles.sendContainer}>
        <input
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
          type="text"
          name="login"
          id="login"
          placeholder="Start typing here..."
          className={styles.sendInput}
        />
        <SendIcon className={styles.sendIcon} onClick={sendMessage} />
      </div>
    </div>
  );
};

export default Messanger;

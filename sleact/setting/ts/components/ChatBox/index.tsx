import { ChatArea, EachMention, Form, MentionsTextarea, SendButton, Toolbox } from '@components/ChatBox/styles';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useEffect, useRef, VFC } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import gravatar from 'gravatar';
import autosize from 'autosize';

interface Props {
  chat: string;
	onSubmitForm: (e: any) => void;
	onChangeChat: (e: any) => void;
	placeholder?: string;
}
const ChatBox: VFC<Props> = ({ chat, onSubmitForm, onChangeChat, placeholder }) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	// onKeyDown 추가해야함
	
	
	useEffect(()=> {
		if(textareaRef.current) {
			autosize(textareaRef.current);
		}
	}, [])
 

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea 
					id="editor-chat"
					value={chat}
					onChange={onChangeChat}
					onKeyDown={onKeydownChat}
					placeholder={placeholder}
					ref={textareaRef}
				/>
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;

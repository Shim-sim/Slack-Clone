import { ChatWrapper } from '@components/Chat/styles';
import { IDM, IChat } from '@typings/db';
import React, { VFC, memo, useMemo } from 'react';
import gravatar from 'gravatar';
import dayjs from 'dayjs';
import regexifySrtring from 'regexify-string';

interface Props {
  data: IDM | IChat;
}


const Chat: VFC<Props> = ({ data }) => {

  const user = 'Sender' in data ? data.Sender : data.User;
	const result = regexifySrtring({
		input: data.content,
		pattern: /@\[.+?\]\(\d+?\)|\n/g,
		decorator(match){
			const arr = match.match(/@\[.+?\]\(\d+?\)/)/!;
			if(arr) {
				return (
					<Link></Link>
				)
			}
		}
	})


  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{dayjs(data.createdAt).format('h:mm A')}</b><br/>
          <span>{data.content}</span>
        </div>
      </div>
    </ChatWrapper>
  );
};

export default Chat;
import { ChatWrapper } from '@components/Chat/styles';
import { IDM, IChat } from '@typings/db';
import React, { VFC, memo, useMemo } from 'react';
import gravatar from 'gravatar';


interface Props {
  data: IDM | IChat;
}


const Chat: VFC<Props> = ({ data }) => {

  const user = 'Sender' in data ? data.Sender : data.User;


  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{data.createdAt}</span>
        </div>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat);
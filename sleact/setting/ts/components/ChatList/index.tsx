import { ChatZone, Section } from '@components/ChatList/styles';
import React, { VFC } from 'react';
import { IDM } from '@typings/db';
import Chat from '@components/Chat'

interface Props {
	chatData?: IDM[];
}

const ChatList: VFC<Props> = ({ chatData }) => {
	return (
		<ChatZone>
			{chatData?.map((chat)=> {
				return (
					<Chat key={chat.id} data={chat} />
				)
			})}
		</ChatZone>
	
	)
}

export default ChatList
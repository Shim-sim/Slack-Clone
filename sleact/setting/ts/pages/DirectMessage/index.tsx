import React, { useCallback, useRef, useEffect } from 'react';
import useInput from '@hooks/useInput';
import { Container, Header } from '@pages/DirectMessage/styles';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import useSWR, { useSWRInfinite } from 'swr';
import ChatBox from '@components/ChatBox';
import Scrollbars from 'react-custom-scrollbars';
import ChatList from '@components/ChatList';
import axios from 'axios';
import { IDM } from '@typings/db';


const DirectMessage = () => {
	
	
	const { workspace, id } = useParams<{ workspace: string; id: string }>();
	const { data: userData } = useSWR(
		`https://sleactserver.run.goorm.io/api/workspaces/${workspace}/users/${id}`,fetcher
	);
	const { data: myData } = useSWR('https://sleactserver.run.goorm.io/api/users',fetcher);
	const [chat, onChangeChat, setChat] = useInput('');
	const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>(
    (index) => `https://sleactserver.run.goorm.io/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
	
	const isEmpty = chatData?.[0]?.length === 0;
	const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

	const scrollbarRef = useRef<Scrollbars>(null);
	const onSubmitForm = useCallback((e)=> {
		e.preventDefault();
		if(chat?.trim()) {
			axios.post(`https://sleactserver.run.goorm.io/api/workspaces/${workspace}/dms/${id}/chats`, {
				content: chat,
			})
			.then(() => {
				revalidate();
				setChat('');
			})
			.catch((error)=> {
				console.log(error);
			})
		}
	}, [chat]);
	
	
	useEffect(()=> {
		
	}, []);
	
	
	if (!userData || !myData) {
		return null;
	};

	const chatSections = makeSection( chatData ? chatData.flat().reverse() : [] );
	
	return (
		
		<Container>
			<Header>
				<img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
				<span>{userData.nickname}</span>
			</Header>
			<ChatList 
				chatSections={chatSections}
				ref={scrollbarRef} 
				setSize={setSize} 
				isEmpty={isEmpty} 
				isReachingEnd={isReachingEnd}
				/>
			<ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
		</Container>
		

	)
}

export default DirectMessage;

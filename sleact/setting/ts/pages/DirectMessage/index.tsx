import React, { useCallback, useRef, useEffect } from 'react';
import useInput from '@hooks/useInput';
import { Container, Header } from '@pages/DirectMessage/styles';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import useSocket from '@hooks/useSocket';
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
	
	const [socket] = useSocket(workspace);
	const isEmpty = chatData?.[0]?.length === 0;
	const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;
	const scrollbarRef = useRef<Scrollbars>(null);
	const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat?.trim() && chatData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id,
            Sender: myData,
            ReceiverId: userData.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            revalidate();
          })
          .catch(console.error);
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );
	
	const onMessage = useCallback((data: IDM) => {
    // id는 상대방 아이디
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
      mutateChat((chatData) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
          ) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 50);
          }
        }
      });
    }
  }, []);
	
	useEffect(()=> {
		socket?.on('dm', onMessage);
		return () => {
			socket?.off('dm', onMessage);
		}
	}, [socket, onMessage ]);
	
	
	useEffect(()=> {
		if(chatData?.length === 1) {
			scrollbarRef.current?.scrollToBottom();
		}
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
				isReachingEnd={isReachingEnd}
				/>
			<ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm}/>
		</Container>
		

	)
}

export default DirectMessage;

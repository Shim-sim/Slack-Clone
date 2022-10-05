import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import React, { VFC, useCallback } from 'react';
import { Button, Input, Label } from '@pages/SignUp/styles';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';


interface Props {
	show: boolean;
	onCloseModal: () => void;
	setShowCreateChannelModal: (flag: boolean) => void;
}


const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal }) => {
	const [newChannel, onChangeNewChannel, setNewChannel] = useInput('');
	const { workspace, channel } = useParams<{ workspace: string, channel: string }>();

	
	const { data: userData, error, revalidate, mutate } = useSWR<IUser | false>(
		'https://sleactserver.run.goorm.io/api/users',
		fetcher,
		{
			dedupingInterval: 2000,
		},
	);
	
	const { data: channelData, revalidate: revalidateChannel } = useSWR<IChannel[]>(
		userData ? `https://sleactserver.run.goorm.io/api/workspaces/${workspace}/channels` : null,
		fetcher
	);
	
	const onCreateChannel = useCallback((e)=> {
		e.preventDefault();
		axios.post(`https://sleactserver.run.goorm.io/api/workspaces/${workspace}/channels`, {
			name: newChannel,
		}, {
			withCredentials: true,
		})
		.then((response)=> {
			console.log(response.data)
			setShowCreateChannelModal(false);
			revalidateChannel();
			setNewChannel('');
		})
		.catch((error) => {
			console.dir(error);
		});
	}, [newChannel]); 
	
	
	return (
		<Modal show={show} onCloseModal={onCloseModal}>
			<form onSubmit={onCreateChannel}>
				<Label id="channel-label">
					<span>채널</span>
					<Input id="channel" value={newChannel} onChange={onChangeNewChannel} />
				</Label>
				<Button type="submit">생성하기</Button>
			</form>
		</Modal>
	)
};

export default CreateChannelModal
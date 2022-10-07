import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}
const InviteWorkspaceModal: FC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const [newMember, onChangeNewMember, setNewMember] = useInput('');
  const { data: userData } = useSWR<IUser>('https://sleactserver.run.goorm.io/api/users', fetcher);
  const { revalidate: revalidateMember } = useSWR<IChannel[]>(
    userData ? `https://sleactserver.run.goorm.io/api/workspaces/${workspace}/members` : null,
    fetcher,
  );

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) {
        return;
      }
      axios
        .post(`https://sleactserver.run.goorm.io/api/workspaces/${workspace}/members`, {
          email: newMember,
        })
        .then((response) => {
          revalidateMember();
          setShowInviteWorkspaceModal(false);
          setNewMember('');
        })
        .catch((error) => {
          console.dir(error);
        });
    },
    [workspace, newMember],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
};

export default InviteWorkspaceModal;

import { api } from './api';
import type { AnyFormComponent } from '@/form/registry/componentRegistry';

export interface ComponentGroupData {
  groupId: string;
  name: string;
  components: AnyFormComponent[];
  createdBy: string;
  sharedWith: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchGroups(): Promise<ComponentGroupData[]> {
  const res = await api.get<{ groups: ComponentGroupData[] }>('/api/groups');
  return res.groups;
}

export async function addGroup(
  name: string,
  components: AnyFormComponent[]
): Promise<ComponentGroupData> {
  const res = await api.post<{ group: ComponentGroupData }>('/api/groups', {
    name,
    components,
  });
  return res.group;
}

export async function updateGroup(
  groupId: string,
  updates: {
    name?: string;
    sharedWith?: string[];
    isPublic?: boolean;
    components?: AnyFormComponent[];
  }
): Promise<ComponentGroupData> {
  const res = await api.patch<{ group: ComponentGroupData }>(
    `/api/groups/${groupId}`,
    updates
  );
  return res.group;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await api.delete(`/api/groups/${groupId}`);
}

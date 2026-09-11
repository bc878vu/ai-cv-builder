import { redirect } from 'next/navigation';
import { isAdmin } from '../../admin-auth';
import AdminPanel from '../panel-client';

export const dynamic='force-dynamic';
export default async function AdminPanelPage(){if(!await isAdmin())redirect('/admin/login');return <AdminPanel/>}

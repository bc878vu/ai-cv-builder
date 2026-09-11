import { redirect } from 'next/navigation';
import { isAdmin } from '../admin-auth';

export default async function AdminEntry(){redirect(await isAdmin()?'/admin/panel':'/admin/login')}

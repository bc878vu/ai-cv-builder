import { getSiteContent } from './site-content';
export default async function CmsHero({page,title,description}:{page:string;title:string;description:string}){const c=await getSiteContent(page);return <><h1>{c.hero_title||title}</h1><p>{c.hero_description||description}</p></>}

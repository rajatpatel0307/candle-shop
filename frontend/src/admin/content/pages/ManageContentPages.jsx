import { ContentManager } from '../components/ContentManager.jsx';
import { ContentEditor } from '../components/ContentEditor.jsx';
export function ManageContentPages() { return <ContentManager kind="pages" title="Content pages" description="Create and maintain your store information and policy pages." Form={ContentEditor} />; }

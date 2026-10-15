import { ContentManager } from '../components/ContentManager.jsx';
import { PromotionForm } from '../components/PromotionForm.jsx';
export function ManagePromotions() { return <ContentManager kind="promotions" title="Promotions" description="Manage promotional sections, images, and calls to action." Form={PromotionForm} />; }

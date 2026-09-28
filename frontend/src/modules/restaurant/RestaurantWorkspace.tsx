import ModuleWorkspace, { type ModuleConfiguration } from '../ModuleWorkspace';
import RestaurantEditor from './RestaurantEditor';
import RestaurantDashboard from './RestaurantDashboard';
import RestaurantPublishing from './RestaurantPublishing';
import { emptyRestaurant, type RestaurantData } from './model';
const config: ModuleConfiguration<RestaurantData> = {
  type: 'restaurant', create: emptyRestaurant, Dashboard: RestaurantDashboard, Editor: RestaurantEditor, Publication: RestaurantPublishing,
  dashboardLabel: 'Logística y recetas', editorLabel: 'Menú y secciones',
  parse(value) {
    const data = value as RestaurantData;
    if (!data || data.version !== 1 || !Array.isArray(data.dishes) || !Array.isArray(data.inventory) || !Array.isArray(data.recipes) || !Array.isArray(data.sections) || !Array.isArray(data.preparations) || !data.settings || !Array.isArray(data.settings.faq)) throw new Error('El documento tiene un formato incompatible. No se ha sobrescrito.');
    return data;
  },
};
export default function RestaurantWorkspace() { return <ModuleWorkspace config={config} />; }

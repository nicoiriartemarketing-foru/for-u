import { RestaurantProvider } from '../../context/RestaurantContext';
import RestaurantAdmin from './RestaurantAdmin';

export default function RestaurantWorkspace() {
  return (
    <RestaurantProvider>
      <RestaurantAdmin />
    </RestaurantProvider>
  );
}

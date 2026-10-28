import { EducationalResource } from '../types';
import { INITIAL_RESOURCES } from '../mocks/mockResourcesData';
import { getStoredItem, setStoredItem } from './storage';

const RESOURCES_KEY = 'educational_resources';

export const resourceService = {
  getResources(): EducationalResource[] {
    return getStoredItem<EducationalResource[]>(RESOURCES_KEY, INITIAL_RESOURCES);
  },

  getResourceBySlug(slug: string): EducationalResource | undefined {
    return this.getResources().find((r) => r.slug === slug);
  },

  toggleBookmark(id: string): EducationalResource | undefined {
    const list = this.getResources();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    const updated: EducationalResource = {
      ...list[index],
      isBookmarked: !list[index].isBookmarked,
    };
    const updatedList = [...list];
    updatedList[index] = updated;
    setStoredItem(RESOURCES_KEY, updatedList);
    return updated;
  },
};

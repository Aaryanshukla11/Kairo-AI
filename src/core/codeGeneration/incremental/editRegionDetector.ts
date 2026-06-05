export interface DetectedRegion {
  start: number;
  end: number;
}

export class EditRegionDetector {
  public detectRegion(content: string, keyword: string): DetectedRegion {
    const idx = content.indexOf(keyword);
    if (idx === -1) {
      return { start: 0, end: 0 };
    }
    return {
      start: idx,
      end: idx + keyword.length
    };
  }
}

export const editRegionDetector = new EditRegionDetector();

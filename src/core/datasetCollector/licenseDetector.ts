export class LicenseDetector {
  public detectLicense(content: string): string {
    if (!content || content.trim().length === 0) {
      return 'Unknown';
    }

    const text = content.toLowerCase();

    if (
      text.includes('mit license') ||
      text.includes('permission is hereby granted, free of charge') ||
      text.includes('spdx-license-identifier: mit')
    ) {
      return 'MIT';
    }

    if (
      text.includes('apache license') ||
      text.includes('apache-2.0') ||
      text.includes('http://www.apache.org/licenses/license-2.0') ||
      text.includes('spdx-license-identifier: apache-2.0')
    ) {
      return 'Apache-2.0';
    }

    if (
      text.includes('gnu general public license') ||
      text.includes('gpl-3.0') ||
      text.includes('gpl-2.0') ||
      text.includes('spdx-license-identifier: gpl')
    ) {
      return 'GPL';
    }

    if (
      text.includes('bsd 3-clause') ||
      text.includes('bsd 2-clause') ||
      text.includes('redistribution and use in source and binary forms') ||
      text.includes('spdx-license-identifier: bsd')
    ) {
      return 'BSD';
    }

    if (
      text.includes('isc license') ||
      text.includes('permission to use, copy, modify, and/or distribute this software for any purpose') ||
      text.includes('spdx-license-identifier: isc')
    ) {
      return 'ISC';
    }

    if (
      text.includes('mozilla public license') ||
      text.includes('mpl-2.0') ||
      text.includes('spdx-license-identifier: mpl-2.0')
    ) {
      return 'MPL-2.0';
    }

    if (
      text.includes('creative commons') ||
      text.includes('cc0-1.0') ||
      text.includes('cc-by') ||
      text.includes('spdx-license-identifier: cc')
    ) {
      return 'Creative-Commons';
    }

    if (
      text.includes('the unlicense') ||
      text.includes('this is free and unencumbered software released into the public domain')
    ) {
      return 'Unlicense';
    }

    return 'Unknown';
  }

  public detectLicenseFromFilename(filename: string): string | null {
    const name = filename.toLowerCase();
    if (name.includes('license') || name.includes('copying')) {
      return 'LICENSE_FILE';
    }
    return null;
  }
}

export const licenseDetector = new LicenseDetector();

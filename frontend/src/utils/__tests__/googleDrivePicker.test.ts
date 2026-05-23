/**
 * @jest-environment jsdom
 */
import { isGoogleDrivePickerConfigured } from '../googleDrivePicker';

describe('googleDrivePicker', () => {
  it('isGoogleDrivePickerConfigured 는 boolean', () => {
    expect(typeof isGoogleDrivePickerConfigured()).toBe('boolean');
  });
});

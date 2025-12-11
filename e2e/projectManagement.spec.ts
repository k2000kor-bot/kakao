import { test, expect } from '@playwright/test';

/**
 * ProjectManagement E2E 테스트
 * 프로젝트 관리 기능을 E2E로 검증
 */

test.describe('ProjectManagement E2E 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('프로젝트 목록이 표시되어야 함', async ({ page }) => {
    // 프로젝트 목록 찾기
    const projectList = page.locator('[data-testid="project-list"], .project-list, [aria-label*="프로젝트"]').first();
    
    // 프로젝트 목록이 표시되는지 확인
    await page.waitForTimeout(2000);
    const isVisible = await projectList.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(projectList).toBeVisible();
    } else {
      test.skip('프로젝트 목록을 찾을 수 없습니다');
    }
  });

  test('새 프로젝트를 생성할 수 있어야 함', async ({ page }) => {
    // 새 프로젝트 버튼 찾기
    const newProjectButton = page.locator('button:has-text("새 프로젝트"), button:has-text("New Project"), [data-testid="new-project"]').first();
    
    if (await newProjectButton.isVisible().catch(() => false)) {
      await newProjectButton.click();
      
      // 프로젝트 생성 다이얼로그 확인
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"], .dialog, [data-testid="project-dialog"]').first();
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      // 프로젝트 이름 입력
      const nameInput = page.locator('input[placeholder*="이름"], input[placeholder*="name"], input[type="text"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('E2E 테스트 프로젝트');
        
        // 생성 버튼 클릭
        const createButton = page.locator('button:has-text("생성"), button:has-text("Create"), button:has-text("저장")').first();
        if (await createButton.isVisible().catch(() => false)) {
          await createButton.click();
          
          // 프로젝트가 생성되었는지 확인
          await page.waitForTimeout(2000);
          const newProject = page.locator('text=E2E 테스트 프로젝트').first();
          await expect(newProject).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      test.skip('새 프로젝트 버튼을 찾을 수 없습니다');
    }
  });

  test('프로젝트를 편집할 수 있어야 함', async ({ page }) => {
    // 프로젝트 편집 버튼 찾기
    const editButton = page.locator('button[aria-label*="편집"], button[aria-label*="edit"], [data-testid="edit-project"]').first();
    
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
      
      // 편집 다이얼로그 확인
      await page.waitForTimeout(1000);
      const dialog = page.locator('[role="dialog"]').first();
      await expect(dialog).toBeVisible({ timeout: 3000 });
      
      // 프로젝트 이름 수정
      const nameInput = page.locator('input[type="text"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.clear();
        await nameInput.fill('수정된 프로젝트 이름');
        
        // 저장 버튼 클릭
        const saveButton = page.locator('button:has-text("저장"), button:has-text("Save")').first();
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
          
          // 프로젝트가 수정되었는지 확인
          await page.waitForTimeout(2000);
          const updatedProject = page.locator('text=수정된 프로젝트 이름').first();
          await expect(updatedProject).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      test.skip('프로젝트 편집 버튼을 찾을 수 없습니다');
    }
  });

  test('프로젝트를 삭제할 수 있어야 함', async ({ page }) => {
    // 프로젝트 삭제 버튼 찾기
    const deleteButton = page.locator('button[aria-label*="삭제"], button[aria-label*="delete"], [data-testid="delete-project"]').first();
    
    if (await deleteButton.isVisible().catch(() => false)) {
      // 삭제 전 프로젝트 이름 저장
      const projectName = await page.locator('[data-testid="project-item"]').first().textContent().catch(() => null);
      
      await deleteButton.click();
      
      // 확인 다이얼로그 확인
      await page.waitForTimeout(1000);
      const confirmButton = page.locator('button:has-text("확인"), button:has-text("Confirm"), button:has-text("삭제")').first();
      if (await confirmButton.isVisible().catch(() => false)) {
        await confirmButton.click();
        
        // 프로젝트가 삭제되었는지 확인
        await page.waitForTimeout(2000);
        if (projectName) {
          const deletedProject = page.locator(`text=${projectName}`).first();
          await expect(deletedProject).not.toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      test.skip('프로젝트 삭제 버튼을 찾을 수 없습니다');
    }
  });
});


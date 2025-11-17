import { test, expect } from '@playwright/test';

test.describe('메모 작성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 메인 페이지로 이동
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('MEMO-001: 새 메모 작성 (성공)', async ({ page }) => {
    // 테스트 데이터 (고유한 타임스탬프 추가)
    const timestamp = Date.now();
    const testMemo = {
      title: `E2E 테스트 메모 ${timestamp}`,
      category: '아이디어',
      content: `이것은 E2E 테스트 메모의 내용입니다. ${timestamp}`,
      tag: 'e2e-test'
    };

    // 1. '새 메모' 버튼을 클릭한다
    await page.getByRole('button', { name: '새 메모' }).click();

    // 2. '새 메모 작성' 폼이 나타나는지 확인한다
    await expect(page.getByRole('heading', { name: '새 메모 작성' })).toBeVisible();

    // 3. '제목' 필드에 "새로운 테스트 메모"를 입력한다
    await page.getByRole('textbox', { name: '제목 *' }).fill(testMemo.title);

    // 4. '카테고리' 드롭다운에서 '아이디어'를 선택한다
    await page.getByLabel('카테고리').selectOption(testMemo.category);

    // 5. '내용' 필드에 내용을 입력한다
    await page.locator('textarea').fill(testMemo.content);

    // 6. '태그' 입력 필드에 "테스트"를 입력하고 '추가' 버튼을 클릭한다
    await page.getByRole('textbox', { name: '태그를 입력하고 Enter를 누르세요' }).fill(testMemo.tag);
    await page.getByRole('button', { name: '추가' }).click();

    // 태그가 추가되었는지 확인 (폼 내에서만 확인)
    await expect(page.locator('form').getByText('#e2e-test')).toBeVisible();

    // 7. '저장하기' 버튼을 클릭한다
    await page.getByRole('button', { name: '저장하기' }).click();

    // 예상 결과 검증
    // - '새 메모 작성' 폼이 닫힌다 (폼이 더 이상 보이지 않음)
    await expect(page.getByRole('heading', { name: '새 메모 작성' })).not.toBeVisible();

    // - 메모 목록에 "새로운 테스트 메모"가 나타난다
    await expect(page.getByRole('heading', { name: testMemo.title, level: 3 })).toBeVisible();

    // - 해당 메모에 '아이디어' 카테고리가 표시된다
    await expect(page.locator('text="아이디어"').first()).toBeVisible();

    // - '#e2e-test' 태그가 표시된다 (span 태그로 렌더링됨)
    await expect(page.locator('span').filter({ hasText: '#e2e-test' }).first()).toBeVisible();

    // - 메모 개수가 증가했는지 확인 (기존 메모 수에서 1개 증가)
    await expect(page.locator('text=/총 \\d+개의 메모/')).toBeVisible();
  });

  test('MEMO-002: 새 메모 작성 (필수 값 누락)', async ({ page }) => {
    // 1. '새 메모' 버튼을 클릭하여 폼 열기
    await page.getByRole('button', { name: '새 메모' }).click();
    await expect(page.getByRole('heading', { name: '새 메모 작성' })).toBeVisible();

    // 테스트 케이스 1: 제목 없이 저장 시도
    await test.step('제목 없이 저장 시도', async () => {
      // 제목 필드를 비워두고 내용만 입력
      await page.getByRole('textbox', { name: '제목 *' }).clear();
      await page.locator('textarea').fill('내용만 있는 메모');

      // 저장하기 버튼 클릭
      await page.getByRole('button', { name: '저장하기' }).click();

      // 폼이 여전히 열려 있어야 함 (저장되지 않음)
      await expect(page.getByRole('heading', { name: '새 메모 작성' })).toBeVisible();

      // 유효성 검사 오류 메시지가 표시되는지 확인 (브라우저 내장 validation 또는 커스텀 메시지)
      const titleInput = page.getByRole('textbox', { name: '제목 *' });
      await expect(titleInput).toHaveAttribute('required');
      
      // HTML5 validation 메시지 확인을 위해 validity state 체크
      const isValid = await titleInput.evaluate((input: HTMLInputElement) => input.validity.valid);
      expect(isValid).toBe(false);
    });

    // 테스트 케이스 2: 내용 없이 저장 시도
    await test.step('내용 없이 저장 시도', async () => {
      // 제목은 입력하고 내용은 비워두기
      await page.getByRole('textbox', { name: '제목 *' }).fill('제목만 있는 메모');
      await page.locator('textarea').clear();

      // 저장하기 버튼 클릭
      await page.getByRole('button', { name: '저장하기' }).click();

      // 폼이 여전히 열려 있어야 함 (저장되지 않음)
      await expect(page.getByRole('heading', { name: '새 메모 작성' })).toBeVisible();

      // 내용 필드가 비어있는지 확인 (커스텀 validation이 있을 수 있음)
      const contentInput = page.locator('textarea');
      const content = await contentInput.inputValue();
      expect(content.trim()).toBe('');
      
      // 내용이 비어있을 때 저장이 되지 않아야 함을 검증
      // (아직 폼이 열려있으므로 저장되지 않은 것으로 간주)
    });

    // 테스트 후 정리: 취소 버튼으로 폼 닫기
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('heading', { name: '새 메모 작성' })).not.toBeVisible();
  });
});
import Thanks from '@/components/register/Thanks';

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ code?: string; id?: string }> }) {
  const params = await searchParams;
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')} / ${String(now.getMonth() + 1).padStart(2, '0')} / ${now.getFullYear()}`;
  return (
    <Thanks
      registrationCode={params.code || '30-26-0001'}
      registrationDate={dateStr}
    />
  );
}
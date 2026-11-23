import { router } from 'expo-router';

import { EmptyState } from '@/components/gift/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';

export default function NotFoundScreen() {
  return (
    <Screen header={<ScreenHeader title="Not found" />}>
      <EmptyState
        title="This page does not exist"
        message="Let's get you back to your gift ideas."
        actionLabel="Back to home"
        actionIcon="house"
        onAction={() => router.dismissTo('/')}
      />
    </Screen>
  );
}

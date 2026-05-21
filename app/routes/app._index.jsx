import { Text } from '@shopify/polaris';
export default function Index() {
  return (
    <s-page>
      <s-stack direction='inline' gap='base' justifyContent='space-between' alignItems='center'>
        <Text as='h2'>Welcome to Qorix review 👋</Text>
        <s-grid gridTemplateColumns='auto auto' gap='base'>
          <s-button variant='secondary' icon='plus'>
            Request reviews
          </s-button>
          <s-button variant='primary' icon='store'>
            View store
          </s-button>
        </s-grid>
      </s-stack>
    </s-page>
  );
}
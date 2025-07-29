import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

export function useSubscription() {
  const router = useRouter();
  const showSubscriptionModal = ref(false);
  const isMobile = ref(false);
  const isSubscribed = ref(false);

  // Check if the viewport is mobile
  const checkIfMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };

  // Open subscription modal
  const openSubscriptionModal = () => {
    if (isMobile.value) {
      // On mobile, navigate to the full subscription page
      router.push('/subscription');
    } else {
      // On desktop, show the modal
      showSubscriptionModal.value = true;
    }
  };

  // Handle successful subscription
  const handleSubscriptionSuccess = () => {
    isSubscribed.value = true;
    showSubscriptionModal.value = false;
    // You can add any post-subscription logic here
  };

  // Handle subscription cancellation
  const handleSubscriptionCancel = () => {
    showSubscriptionModal.value = false;
  };

  // Set up event listeners for viewport changes
  onMounted(() => {
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkIfMobile);
  });

  return {
    showSubscriptionModal,
    isMobile,
    isSubscribed,
    openSubscriptionModal,
    handleSubscriptionSuccess,
    handleSubscriptionCancel,
  };
}

export default useSubscription;

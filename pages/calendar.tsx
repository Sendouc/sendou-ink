import CalendarPage from "app/calendar/components/CalendarPage";
import HeaderBanner from "components/layout/HeaderBanner";
// import { ssr } from "pages/api/trpc/[trpc]";
// import { trpc } from "utils/trpc";

// export const getStaticProps = async () => {
//   await Promise.all([
//     ssr.prefetchQuery("plus.suggestions"),
//     ssr.prefetchQuery("plus.statuses"),
//   ]);

//   return {
//     props: {
//       dehydratedState: trpc.dehydrate(),
//     },
//     revalidate: 60,
//   };
// };

// @ts-expect-error
CalendarPage.header = (
  <HeaderBanner
    icon="calendar"
    title="Calendar"
    subtitle="Upcoming tournaments and other events."
  />
);

export default CalendarPage;
import { Button } from "@chakra-ui/button";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Box } from "@chakra-ui/layout";
import { t, Trans } from "@lingui/macro";
import EventInfo from "components/calendar/EventInfo";
import { EventModal, FormData } from "components/calendar/EventModal";
import MyHead from "components/common/MyHead";
import SubText from "components/common/SubText";
import { useMyTheme, useUser } from "hooks/common";
import { ssg } from "pages/api/trpc/[trpc]";
import { Fragment, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { trpc } from "utils/trpc";

const CalendarPage = () => {
  const { gray } = useMyTheme();
  const events = trpc.useQuery(["calendar.events"], { enabled: false });
  const [eventToEdit, setEventToEdit] = useState<
    boolean | (FormData & { id: number })
  >(false);
  const [filter, setFilter] = useState("");
  const [user] = useUser();

  let lastPrintedDate: [number, number, Date] | null = null;

  return (
    <>
      <MyHead title={t`Calendar`} />
      {eventToEdit && (
        <EventModal
          onClose={() => setEventToEdit(false)}
          event={typeof eventToEdit === "boolean" ? undefined : eventToEdit}
          refetchQuery={events.refetch}
        />
      )}
      {user && (
        <div>
          <Button
            size="sm"
            onClick={() => setEventToEdit(true)}
            data-cy="add-event-button"
          >
            <Trans>Add event</Trans>
          </Button>
        </div>
      )}
      <InputGroup my={8} maxW="24rem" mx="auto">
        <InputLeftElement pointerEvents="none">
          <FiSearch color={gray} />
        </InputLeftElement>
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} />
      </InputGroup>
      {(events.data ?? [])
        .filter((event) =>
          event.name.toLowerCase().includes(filter.toLowerCase().trim())
        )
        .map((event, i) => {
          const printDateHeader =
            !lastPrintedDate ||
            lastPrintedDate[0] !== event.date.getDate() ||
            lastPrintedDate[1] !== event.date.getMonth();

          if (printDateHeader) {
            lastPrintedDate = [
              event.date.getDate(),
              event.date.getMonth(),
              event.date,
            ];
          }

          const now = new Date();

          const isToday =
            lastPrintedDate![2].getDate() === now.getDate() &&
            lastPrintedDate![2].getMonth() === now.getMonth();

          return (
            <Fragment key={event.id}>
              {printDateHeader && (
                <Box mt={i === 0 ? 0 : 10}>
                  <SubText>
                    {/* TODO */}
                    {event.date.toLocaleDateString("en", {
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}{" "}
                    {isToday && <Trans>(Today)</Trans>}
                  </SubText>
                </Box>
              )}
              <div>
                <EventInfo
                  event={event}
                  edit={() =>
                    setEventToEdit({
                      ...event,
                      date: event.date.toISOString(),
                      // TODO: remove this if later other event types than tournament are allowed
                      // currently in the validator we accept the properties as if you can only submit
                      // tournaments but database is prepared to accept other kind of events
                      // this makes TS freak out a bit
                      discordInviteUrl: event.discordInviteUrl!,
                      tags: event.tags as any,
                      format: event.format as any,
                    })
                  }
                />
              </div>
            </Fragment>
          );
        })}
      <Box color={gray} mt={10}>
        All events listed in your local time:{" "}
        {Intl.DateTimeFormat().resolvedOptions().timeZone}
      </Box>
    </>
  );
};

export const getStaticProps = async () => {
  await ssg.fetchQuery("calendar.events");

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 60,
  };
};

export default CalendarPage;

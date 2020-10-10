import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Grid,
} from "@chakra-ui/core";
import { TFunctionResult } from "i18next";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { modeIconMap } from "../../assets/icons";
import {
  GetUsersXRankPlacementsQuery,
  XRankPlacement,
} from "../../generated/graphql";
import useBreakPoints from "../../hooks/useBreakPoints";
import MyThemeContext from "../../themeContext";
import { Weapon } from "../../types";
import WeaponImage from "../common/WeaponImage";

type Placement = {
  __typename?: "XRankPlacement" | undefined;
} & Pick<
  XRankPlacement,
  "id" | "weapon" | "ranking" | "mode" | "xPower" | "month" | "year"
>;

interface ModesAccordionProps {
  placementsData: GetUsersXRankPlacementsQuery;
}

interface AllModesAccordionData {
  SZ?: ModeAccordionData;
  TC?: ModeAccordionData;
  RM?: ModeAccordionData;
  CB?: ModeAccordionData;
  locale: string;
}

interface ModeAccordionData {
  highestPlacement: number;
  highestPlacementDate: string;
  highestXPower: number;
  highestXPowerDate: string;
  placements: Placement[];
}

interface StyleBoxProps {
  children:
    | string
    | string[]
    | number
    | number[]
    | undefined
    | (string | number | undefined)[]
    | TFunctionResult;
  gridArea?: string;
  color?: string;
  size?: string;
}

const getLocalizedMonthYear = (month: number, year: number, locale: string) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(month - 1);
  date.setFullYear(year);

  return date.toLocaleString(locale, { month: "long", year: "numeric" });
};

const StyledBox: React.FC<StyleBoxProps> = ({
  children,
  color,
  size,
  gridArea,
}) =>
  gridArea ? (
    <Grid
      color={color ?? undefined}
      letterSpacing="wide"
      fontSize={size ?? "xs"}
      textTransform="uppercase"
      fontWeight="semibold"
      textAlign="center"
      gridArea={gridArea}
    >
      {children}
    </Grid>
  ) : (
    <Box
      color={color ?? undefined}
      letterSpacing="wide"
      fontSize={size ?? "xs"}
      textTransform="uppercase"
      fontWeight="semibold"
      textAlign="center"
    >
      {children}
    </Box>
  );

const accordionReducer = function (
  acc: AllModesAccordionData,
  cur: Placement
): AllModesAccordionData {
  const key = cur.mode;
  const modeData = acc[key];
  const date = getLocalizedMonthYear(cur.month, cur.year, acc.locale);
  if (!modeData) {
    acc[key] = {
      highestPlacement: cur.ranking,
      highestPlacementDate: date,
      highestXPower: cur.xPower,
      highestXPowerDate: date,
      placements: [cur],
    };
  } else {
    modeData.placements.push(cur);

    if (cur.xPower > modeData.highestXPower) {
      modeData.highestXPower = cur.xPower;
      modeData.highestXPowerDate = date;
    }

    if (cur.ranking < modeData.highestPlacement) {
      modeData.highestPlacement = cur.ranking;
      modeData.highestPlacementDate = date;
    }
  }

  return acc;
};

const ModesAccordion: React.FC<ModesAccordionProps> = ({ placementsData }) => {
  const { t, i18n } = useTranslation();
  const { themeColorWithShade, grayWithShade, darkerBgColor } = useContext(
    MyThemeContext
  );
  const isSmall: boolean[] = useBreakPoints([560, 835]) as boolean[];

  const placements = placementsData.getUserByIdentifier!.xRankPlacements!;

  const allModesTabsData: AllModesAccordionData = placements.reduce(
    accordionReducer,
    { locale: i18n.language }
  );
  return (
    <Accordion allowMultiple>
      {(["SZ", "TC", "RM", "CB"] as const)
        .filter((key) => allModesTabsData.hasOwnProperty(key))
        .map((key) => {
          const ModeIcon = modeIconMap[key];
          return (
            <AccordionItem key={key}>
              <AccordionButton>
                <AccordionIcon h="2em" w="2em" mr="1em" />
                <ModeIcon color={themeColorWithShade} w="5em" h="5em" />{" "}
                <Grid
                  ml="50px"
                  gridTemplateColumns="repeat(3, 1fr)"
                  gridTemplateRows="repeat(3, 1fr)"
                  gridColumnGap="50px"
                  justifyItems="center"
                  alignItems="center"
                  w="100%"
                  display={isSmall[0] ? "none" : "grid"}
                >
                  <StyledBox color={grayWithShade} gridArea="1 / 1 / 2 / 2">
                    {t("users;Best placement")}
                  </StyledBox>
                  <StyledBox size="s" gridArea="2 / 1 / 3 / 2">
                    {allModesTabsData[key]?.highestPlacement}
                  </StyledBox>
                  <StyledBox color={grayWithShade} gridArea="3 / 1 / 4 / 2">
                    {allModesTabsData[key]?.highestPlacementDate}
                  </StyledBox>

                  <StyledBox color={grayWithShade} gridArea="1 / 2 / 2 / 3">
                    {t("users;Highest power")}
                  </StyledBox>
                  <StyledBox size="s" gridArea="2 / 2 / 3 / 3">
                    {allModesTabsData[key]?.highestXPower}
                  </StyledBox>
                  <StyledBox color={grayWithShade} gridArea="3 / 2 / 4 / 3">
                    {allModesTabsData[key]?.highestXPowerDate}
                  </StyledBox>
                  {!isSmall[1] && (
                    <>
                      <StyledBox color={grayWithShade} gridArea="1 / 3 / 2 / 4">
                        {t("users;Number of placements")}
                      </StyledBox>

                      <StyledBox size="s" gridArea="2 / 3 / 3 / 4">
                        {allModesTabsData[key]?.placements.length}
                      </StyledBox>
                    </>
                  )}
                </Grid>
                <Flex
                  display={!isSmall[0] ? "none" : "flex"}
                  flexDirection="column"
                  pl="1em"
                >
                  <StyledBox color={grayWithShade}>
                    {t("users;Best placement / power")}
                  </StyledBox>
                  <StyledBox size="s">
                    {allModesTabsData[key]?.highestPlacement} /{" "}
                    {allModesTabsData[key]?.highestXPower}
                  </StyledBox>
                </Flex>
              </AccordionButton>
              <AccordionPanel py={4} background={darkerBgColor} mt="3px">
                <Grid
                  gridTemplateColumns="repeat(4, 1fr)"
                  gridTemplateRows="auto"
                  gridRowGap="10px"
                  alignItems="center"
                >
                  {allModesTabsData[key]?.placements.map((placement) => {
                    return (
                      <React.Fragment key={placement.id}>
                        <Box
                          textTransform="uppercase"
                          fontWeight="semibold"
                          fontSize="xs"
                          color={grayWithShade}
                        >
                          {getLocalizedMonthYear(
                            placement.month,
                            placement.year,
                            i18n.language
                          )}
                        </Box>
                        <WeaponImage
                          englishName={placement.weapon as Weapon}
                          size="SMALL"
                        />
                        <Box>{placement.ranking}</Box>
                        <Box>{placement.xPower}</Box>
                      </React.Fragment>
                    );
                  })}
                </Grid>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
    </Accordion>
  );
};

export default ModesAccordion;

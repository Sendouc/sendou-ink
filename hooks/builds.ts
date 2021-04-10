import { Ability, Mode } from "@prisma/client";
import { useRouter } from "next/router";
import { GetBuildsByWeaponData } from "prisma/queries/getBuildsByWeapon";
import { Dispatch, useReducer } from "react";
import useSWR from "swr";
import { abilities, isMainAbility } from "utils/lists/abilities";
import { weaponToCode } from "utils/lists/weaponCodes";
import { weapons } from "utils/lists/weapons";
import { setSearchParams } from "utils/setSearchParams";

export type BuildFilterType = "AT_LEAST" | "AT_MOST" | "HAS" | "DOES_NOT_HAVE";

interface BuildFilter {
  ability: Ability;
  abilityPoints?: { min: number; max: number };
  hasAbility?: boolean;
}

export interface UseBuildsByWeaponState {
  weapon: string;
  filters: BuildFilter[];
  modeFilter?: Mode;
  expandedUsers: Set<number>;
}

type Action =
  | {
      type: "SET_WEAPON";
      weapon: string;
    }
  | {
      type: "EXPAND_USER";
      id: number;
    }
  | {
      type: "ADD_FILTER";
      ability: Ability;
    }
  | {
      type: "REMOVE_FILTER";
      index: number;
    }
  | {
      type: "SET_FILTER_HAS_ABILITY";
      index: number;
      hasAbility: boolean;
    }
  | {
      type: "SET_FILTER_ABILITY_POINTS";
      index: number;
      abilityPoints: { min: number; max: number };
    }
  | {
      type: "SET_MODE_FILTER";
      modeFilter?: Mode;
    };

export type UseBuildsByWeaponDispatch = Dispatch<Action>;

export function useBuildsByWeapon() {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    (oldState: UseBuildsByWeaponState, action: Action) => {
      switch (action.type) {
        case "SET_WEAPON":
          setSearchParams("weapon", action.weapon);

          return { ...oldState, weapon: action.weapon };
        case "EXPAND_USER":
          return {
            ...oldState,
            expandedUsers: new Set([...oldState.expandedUsers, action.id]),
          };
        case "ADD_FILTER":
          const newFilter = isMainAbility(action.ability)
            ? {
                ability: action.ability,
                hasAbility: true,
              }
            : { ability: action.ability, abilityPoints: { min: 3, max: 57 } };

          return {
            ...oldState,
            filters: [...oldState.filters, newFilter].sort(
              (a, b) =>
                abilities.findIndex((ability) => a.ability === ability.code) -
                abilities.findIndex((ability) => b.ability === ability.code)
            ),
          };
        case "REMOVE_FILTER":
          return {
            ...oldState,
            filters: oldState.filters.filter((_, i) => i !== action.index),
          };
        case "SET_FILTER_HAS_ABILITY":
          const filtersTypeCopy = [...oldState.filters];
          filtersTypeCopy[action.index] = {
            ...filtersTypeCopy[action.index],
            hasAbility: action.hasAbility,
          };

          return {
            ...oldState,
            filters: filtersTypeCopy,
          };
        case "SET_FILTER_ABILITY_POINTS":
          const filtersAbilityPointsCopy = [...oldState.filters];
          filtersAbilityPointsCopy[action.index] = {
            ...filtersAbilityPointsCopy[action.index],
            abilityPoints: {
              max: Number.isNaN(action.abilityPoints.max)
                ? 0
                : action.abilityPoints.max,
              min: Number.isNaN(action.abilityPoints.min)
                ? 0
                : action.abilityPoints.min,
            },
          };

          return {
            ...oldState,
            filters: filtersAbilityPointsCopy,
          };
        case "SET_MODE_FILTER":
          return {
            ...oldState,
            modeFilter: action.modeFilter,
          };
        default:
          return oldState;
      }
    },
    {
      weapon: getInitialWeapon(),
      filters: [],
      expandedUsers: new Set() as Set<number>,
    }
  );

  function getInitialWeapon() {
    if (
      typeof router.query.weapon !== "string" ||
      !weapons.includes(router.query.weapon as any)
    ) {
      return "";
    }

    return router.query.weapon;
  }

  const { data } = useSWR<GetBuildsByWeaponData>(() => {
    if (!state.weapon) return null;

    const key = state.weapon as keyof typeof weaponToCode;
    return `/api/builds/${weaponToCode[key]}`;
  });

  const buildArrays = data ?? [];

  const buildsToShow = buildArrays.reduce(
    (acc: GetBuildsByWeaponData, buildArray) => {
      const filteredArray = buildArray.filter((build) => {
        if (state.filters.length) {
          if (
            !state.filters.every((filter) => {
              // @ts-ignore
              const apCount = build.abilityPoints[filter.ability] ?? 0;

              if (typeof filter.hasAbility === "boolean")
                return (
                  (filter.hasAbility && apCount > 0) ||
                  (!filter.hasAbility && apCount === 0)
                );

              if (filter.abilityPoints) {
                return (
                  apCount >= filter.abilityPoints.min &&
                  apCount <= filter.abilityPoints.max
                );
              }

              console.error(
                "filter had no 'show' or 'abilityPoints' attributes"
              );
              return true;
            })
          ) {
            return false;
          }
        }

        if (state.modeFilter) {
          if (!build.modes.some((mode) => mode === state.modeFilter)) {
            return false;
          }
        }

        return true;
      });

      if (!filteredArray.length) return acc;

      return [...acc, filteredArray];
    },
    []
  );

  const stats = Object.entries(
    buildsToShow.reduce(
      (acc: Record<Ability, Record<number, number>>, buildArr) => {
        buildArr.forEach(({ abilityPoints }) => {
          abilities.forEach(({ code }) => {
            // @ts-ignore
            const buildAPCount = (abilityPoints[code] as number) ?? 0;
            let existingApRecord = acc[code][buildAPCount] ?? 0;
            acc[code][buildAPCount] = ++existingApRecord;
          });
        });

        return acc;
      },
      getStatsInitialValue()
    )
  )
    .map(([abilityCode, apCounts]) => {
      return {
        code: abilityCode as Ability,
        average:
          Object.entries(apCounts).reduce(
            (acc, cur) => Number(cur[0]) * cur[1] + acc,
            0
          ) / Object.values(apCounts).reduce((acc, cur) => acc + cur, 0),
        counts: Object.entries(apCounts)
          .map(([ap, count]) => [Number(ap), count])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3),
      };
    })
    .sort((a, b) => b.average - a.average);

  return {
    data: buildsToShow,
    isLoading: state.weapon && !data,
    stats,
    state,
    dispatch,
    hiddenBuildCount: buildArrays.length - buildsToShow.length,
  };
}

function getStatsInitialValue() {
  const result: Partial<Record<Ability, Record<number, number>>> = {};

  abilities.forEach(({ code }) => {
    result[code] = {};
  });

  return result as Record<Ability, Record<number, number>>;
}

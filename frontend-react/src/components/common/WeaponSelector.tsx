import React from "react"
import { Flex, Box } from "@chakra-ui/core"
import {
  weaponSelectOptions,
  weaponSelectOptionsWithAlts,
} from "../../utils/lists"
import WeaponImage from "./WeaponImage"
import { components } from "react-select"
import Select from "../elements/Select"
import { Weapon } from "../../types"
import { useTranslation } from "react-i18next"

interface WeaponSelectorProps {
  value?: Weapon | Weapon[] | "" | null
  setValue: (value: any) => void
  label: string
  required?: boolean
  autoFocus?: boolean
  clearable?: boolean
  isMulti?: boolean
  menuIsOpen?: boolean
  showAlts?: boolean
}

const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  value,
  setValue,
  label,
  clearable,
  autoFocus,
  required,
  isMulti,
  menuIsOpen,
  showAlts,
}) => {
  const { t } = useTranslation()
  const singleOption = (props: any) => (
    <components.Option {...props}>
      <Flex alignItems="center" color={props.isFocused ? "black" : undefined}>
        <Box mr="0.5em">
          <WeaponImage size="SMALL" englishName={props.value} />
        </Box>
        {props.label}
      </Flex>
    </components.Option>
  )

  return (
    <>
      <Select
        label={label}
        required={required}
        options={
          showAlts
            ? weaponSelectOptionsWithAlts.map((category) => ({
                label: t(`builds;${category.label}`),
                options: category.options.map((weapon) => ({
                  value: weapon.value,
                  label: t(`game;${weapon.value}`),
                })),
              }))
            : weaponSelectOptions.map((category) => ({
                label: t(`builds;${category.label}`),
                options: category.options.map((weapon) => ({
                  value: weapon.value,
                  label: t(`game;${weapon.value}`),
                })),
              }))
        }
        value={value}
        setValue={setValue}
        clearable={clearable}
        isSearchable
        isMulti={!!isMulti}
        menuIsOpen={menuIsOpen}
        components={{
          IndicatorSeparator: () => null,
          Option: singleOption,
        }}
        autoFocus={autoFocus}
        width="100%"
      />
    </>
  )
}

export default WeaponSelector

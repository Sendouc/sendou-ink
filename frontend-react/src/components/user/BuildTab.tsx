import React from "react"
import { Build } from "../../types"
import useLocalStorage from "@rehooks/local-storage"
import { useState } from "react"
import { HeadGear, ClothingGear, ShoesGear, Ability } from "../../types"
import BuildFormModal from "./BuildFormModal"
import Button from "../elements/Button"
import Alert from "../elements/Alert"
import BuildCard from "../builds/BuildCard"
import { Box } from "@chakra-ui/core"
import { useTranslation } from "react-i18next"

interface BuildTabProps {
  builds: Build[]
  canModifyBuilds: boolean
  unlimitedBuilds: boolean
}

type ExistingGearObject = Record<
  Partial<HeadGear | ClothingGear | ShoesGear>,
  Ability[]
>

const buildsReducer = (acc: ExistingGearObject, cur: Build) => {
  if (cur.headgearItem) {
    acc[cur.headgearItem] = [...cur.headgear]
  }
  if (cur.clothingItem) {
    acc[cur.clothingItem] = [...cur.clothing]
  }
  if (cur.shoesItem) {
    acc[cur.shoesItem] = [...cur.shoes]
  }
  return acc
}

const BuildTab: React.FC<BuildTabProps> = ({
  builds,
  canModifyBuilds,
  unlimitedBuilds,
}) => {
  const [APView] = useLocalStorage<boolean>("prefersAPView")
  const [formOpen, setFormOpen] = useState(false)
  const [buildBeingEdited, setBuildBeingEdited] = useState<Build | null>(null)
  const { t } = useTranslation()

  const existingGear = builds
    ? builds.reduce(buildsReducer, {} as ExistingGearObject)
    : ({} as ExistingGearObject)

  const canAddBuilds = builds.length < 100 || unlimitedBuilds

  return (
    <>
      {formOpen && (
        <BuildFormModal
          existingGear={existingGear}
          closeModal={() => {
            setFormOpen(false)
            setBuildBeingEdited(null)
          }}
          buildBeingEdited={buildBeingEdited}
        />
      )}
      {canModifyBuilds && canAddBuilds && (
        <Button onClick={() => setFormOpen(true)}>
          {t("users;Add build")}
        </Button>
      )}
      {canModifyBuilds && !canAddBuilds && (
        <Alert status="info">{t("users;tooManyBuilds")}</Alert>
      )}
      <Box display="flex" flexWrap="wrap" mt="1em">
        {builds.map((build) => (
          <BuildCard
            canModify={canModifyBuilds}
            setBuildBeingEdited={(build: Build) => {
              setBuildBeingEdited(build)
              setFormOpen(true)
            }}
            key={build.id}
            build={build}
            defaultToAPView={APView !== null ? APView : false}
            m="0.5em"
          />
        ))}
      </Box>
    </>
  )
}

export default BuildTab

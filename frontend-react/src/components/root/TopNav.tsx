import { useQuery } from "@apollo/client";
import {
    Box, Button, Flex,
    Grid,
    IconButton,
    Menu,
    MenuButton,
    MenuGroup,
    MenuItem,
    MenuList,
    useColorMode
} from "@chakra-ui/core";
import { Link } from "@reach/router";
import React, { Suspense, useContext } from "react";
import { useTranslation } from "react-i18next";
import { FiMoon, FiSun } from "react-icons/fi";
import { DiscordIcon } from "../../assets/icons";
import { USER } from "../../graphql/queries/user";
import MyThemeContext from "../../themeContext";
import { UserData } from "../../types";
import UserAvatar from "../common/UserAvatar";
import ColorSelector from "./ColorSelector";
import { LanguageSelector } from "./LanguageSelector";

const TopNav = () => {
  const { bgColor, colorMode, darkerBgColor, textColor } = useContext(
    MyThemeContext
  );
  const { toggleColorMode } = useColorMode();

  const UserItem = () => {
    const { t } = useTranslation();
    const { data, loading } = useQuery<UserData>(USER);

    if (loading) return <Box />;
    if (!data?.user)
      return (
        <a href="/auth/discord">
          <Button leftIcon={<DiscordIcon />} variant="ghost" size="sm">
            {t("navigation;Log in via Discord")}
          </Button>
        </a>
      );
    //*<Link to={`/u/${data.user.discord_id}`}>
    return (
      <Menu>
        <MenuButton>
          <UserAvatar
            src={data.user.avatar}
            name={data.user.username}
            size="sm"
            m={1}
            cursor="pointer"
          />
        </MenuButton>
        <MenuList bg={darkerBgColor} color={textColor}>
          <MenuGroup title={data.user.username}>
            <Link to={`/u/${data.user.discord_id}`}>
              <MenuItem>{t("navigation;Profile")}</MenuItem>
            </Link>
            <a href="/logout">
              <MenuItem>{t("navigation;Log out")}</MenuItem>
            </a>
          </MenuGroup>
        </MenuList>
      </Menu>
    );
  };

  return (
    <Grid
      templateColumns={["1fr 1fr", null, "1fr 1fr 1fr"]}
      bg={bgColor}
      w="100%"
      alignItems="center"
      justifyContent="space-between"
      p={1}
    >
      <Suspense fallback={null}>
        <Flex alignItems="center">
          <IconButton
            aria-label={`Switch to ${
              colorMode === "light" ? "dark" : "light"
            } mode`}
            variant="ghost"
            color="current"
            fontSize="20px"
            onClick={toggleColorMode}
            icon={colorMode === "light" ? <FiSun /> : <FiMoon />}
            borderRadius="50%"
          />
          <ColorSelector />
          <LanguageSelector />
        </Flex>
        <Box
          justifySelf="center"
          fontFamily="Rubik, sans-serif"
          color="gray.600"
          fontWeight="bold"
          letterSpacing={1}
          display={["none", null, "block"]}
        >
          {" "}
          <Link to="/">sendou.ink (old)</Link>
        </Box>
        <Box justifySelf="flex-end">
          <UserItem />
        </Box>
      </Suspense>
    </Grid>
  );
};

export default TopNav;

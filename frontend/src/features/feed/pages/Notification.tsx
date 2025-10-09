import {
  Avatar,
  Box,
  Button,
  Grid,
  GridItem,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Flex,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useToast,
  IconButton,
  Divider,
  Heading,
  Container,
  useBreakpointValue,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import {
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  useAuthentication,
  type User,
} from "../../authentication/context/AuthenticationContextProvider";
import { request } from "../../../utils/api";
import { TimeAgo } from "../TimeAgo";
import LeftSidebar from "../components/leftBar/LeftBar";
import RightSidebar from "../components/rightBar/RightBar";
import {
  FaHeart,
  FaComment,
  FaCheck,
  FaBell,
  FaCheckDouble,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import { useCount } from "../../../components/Notify/CountContext";

type INotificationType = 'LIKE' | 'COMMENT';

export interface Notification {
  id: number;
  recipient: User;
  sender: User;
  read: boolean;
  type: INotificationType;
  resourceId: number;
  creationDate: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { user } = useAuthentication();
  const toast = useToast();
  const { setCount } = useCount();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerPadding = useBreakpointValue({ base: 2, md: 6 });
  const headerPadding = useBreakpointValue({ base: 4, md: 6 });
  const cardPadding = useBreakpointValue({ base: 3, md: 4 });
  const headingSize = useBreakpointValue({ base: "md", md: "lg" });
  const buttonSize = useBreakpointValue({ base: "xs", md: "sm" });

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    console.log("📡 Fetching notifications...");

    return new Promise<Notification[]>((resolve, reject) => {
      request<Notification[]>({
        endpoint: "/api/v1/notifications",
        onSuccess: (fetched) => {
          console.log("✅ Notifications fetched:", fetched);
          const uniqueNotifications = Array.from(
            new Map(fetched.map((n) => [n.id, n])).values()
          );
          resolve(uniqueNotifications);
        },
        onFailure: (error) => {
          console.error("❌ Error fetching notifications:", error);
          reject(error);
        },
      });
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const fetchedNotifications = await fetchNotifications();
        setNotifications(fetchedNotifications);
      } catch (error) {
        toast({
          title: "Error loading notifications",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [fetchNotifications, toast]);

  // Polling for new notifications with better logic
  // useEffect(() => {
  //   if (isLoading) return; // Don't poll while initial loading

  //   const pollInterval = isMobile ? 60000 : 30000; // 60s mobile, 30s desktop

  //   const interval = setInterval(async () => {
  //     // Only poll if document is visible
  //     if (document.hidden) return;

  //     console.log("🔄 Polling for new notifications...");

  //     try {
  //       const fetchedNotifications = await fetchNotifications();

  //       // Check for new notifications
  //       const newNotifications = fetchedNotifications.filter(
  //         (newNotif) =>
  //           !notifications.some((existing) => existing.id === newNotif.id)
  //       );

  //       if (newNotifications.length > 0) {
  //         console.log("🆕 New notifications found:", newNotifications);
  //         setNotifications(fetchedNotifications);

  //         // Show toast for new notifications
  //         newNotifications.forEach((notif) => {
  //           toast({
  //             title: "New notification",
  //             description: `${notif.sender?.firstName} ${
  //               notif.type === INotificationType.LIKE
  //                 ? "liked"
  //                 : "commented on"
  //             } your post`,
  //             status: "info",
  //             duration: 4000,
  //             isClosable: true,
  //           });
  //         });
  //       } else {
  //         // Update notifications even if no new ones (in case of read status changes)
  //         setNotifications(fetchedNotifications);
  //       }
  //     } catch (error) {
  //       console.error("❌ Polling error:", error);
  //     }
  //   }, pollInterval);

  //   return () => clearInterval(interval);
  // }, [notifications, toast, isMobile, isLoading, fetchNotifications]);

  // Update count whenever notifications change
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    console.log("📊 Updating notification count:", unreadCount);
    setCount(unreadCount);
  }, [notifications, setCount]);

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);

    if (unreadNotifications.length === 0) return;

    console.log("📨 Marking all notifications as read");

    try {
      // Mark all as read in parallel
      await Promise.all(
        unreadNotifications.map(
          (notification) =>
            new Promise<void>((resolve, reject) => {
              request({
                endpoint: `/api/v1/notifications/${notification.id}`,
                method: "PUT",
                onSuccess: () => {
                  console.log(
                    "✅ Notification marked as read:",
                    notification.id
                  );
                  resolve();
                },
                onFailure: (error) => {
                  console.error(
                    "❌ Failed to mark notification as read:",
                    error
                  );
                  reject(error);
                },
              });
            })
        )
      );

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      toast({
        title: "All notifications marked as read",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error marking notifications as read",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;
  // setCount(unreadCount);
  const MobileFilterMenu = () => (
    <Menu>
      <MenuButton
        as={Button}
        size={buttonSize}
        variant="outline"
        colorScheme="whiteAlpha"
        rightIcon={<FaChevronDown />}
        leftIcon={<FaFilter />}
      >
        {filter === "all" ? "All" : "Unread"}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => setFilter("all")}>All Notifications</MenuItem>
        <MenuItem onClick={() => setFilter("unread")}>Unread Only</MenuItem>
      </MenuList>
    </Menu>
  );

  const DesktopFilters = () => (
    <HStack
      spacing={2}
      sx={{
        // Hide scrollbar but keep functionality
        "&::-webkit-scrollbar": {
          display: "none", // Safari and Chrome
        },
        "-ms-overflow-style": "none", // IE and Edge
        "scrollbar-width": "none", // Firefox
      }}
    >
      <Button
        size={buttonSize}
        variant={filter === "all" ? "solid" : "outline"}
        colorScheme="whiteAlpha"
        onClick={() => setFilter("all")}
        leftIcon={<FaFilter />}
      >
        All
      </Button>
      <Button
        size={buttonSize}
        variant={filter === "unread" ? "solid" : "outline"}
        colorScheme="whiteAlpha"
        onClick={() => setFilter("unread")}
      >
        Unread
      </Button>
    </HStack>
  );

  if (isMobile) {
    return (
      <Container maxW="100%" p={containerPadding} minH="100vh">
        <Box
          // eslint-disable-next-line react-hooks/rules-of-hooks
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="xl"
          boxShadow="lg"
          overflow="hidden"
          border="1px solid"
          // eslint-disable-next-line react-hooks/rules-of-hooks
          borderColor={useColorModeValue("gray.100", "gray.700")}
          minH="calc(100vh - 32px)"
        >
          {/* Mobile Header */}
          <Box
            p={headerPadding}
            // eslint-disable-next-line react-hooks/rules-of-hooks
            bgGradient={useColorModeValue(
              "linear(to-r, blue.500, purple.500)",
              "linear(to-r, blue.600, purple.600)"
            )}
            color="white"
          >
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <FaBell size={20} />
                  <Heading size={headingSize}>Notifications</Heading>
                  {unreadCount > 0 && (
                    <Badge
                      colorScheme="red"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </HStack>

                {unreadCount > 0 && (
                  <IconButton
                    size={buttonSize}
                    aria-label="Mark all as read"
                    icon={<FaCheckDouble />}
                    colorScheme="whiteAlpha"
                    variant="outline"
                    onClick={markAllAsRead}
                  />
                )}
              </Flex>

              <Flex justify="space-between" align="center">
                <MobileFilterMenu />
                <Text fontSize="sm" opacity={0.9}>
                  {filteredNotifications.length} {filter} notification
                  {filteredNotifications.length !== 1 ? "s" : ""}
                </Text>
              </Flex>
            </VStack>
          </Box>

          {/* Mobile Notifications List */}
          <VStack
            spacing={0}
            align="stretch"
            maxH="calc(100vh - 180px)"
            overflowY="auto"
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                background: useColorModeValue("#CBD5E0", "#4A5568"),
                borderRadius: "2px",
              },
            }}
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} p={cardPadding}>
                  <HStack spacing={3}>
                    <SkeletonCircle size="10" />
                    <Box flex="1">
                      <Skeleton height="16px" mb={2} />
                      <SkeletonText noOfLines={1} fontSize="sm" />
                    </Box>
                  </HStack>
                  {i < 4 && <Divider mt={cardPadding} />}
                </Box>
              ))
            ) : filteredNotifications.length === 0 ? (
              <Box p={8} textAlign="center">
                <FaBell size={32} color="gray" opacity={0.3} />
                <Text mt={3} fontSize="md" color="gray.500" fontWeight="medium">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </Text>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  {filter === "unread"
                    ? "All caught up! 🎉"
                    : "New notifications will appear here"}
                </Text>
              </Box>
            ) : (
              filteredNotifications.map((notification, index) => (
                <Box key={`mobile-${notification.id}`}>
                  <NotificationItem
                    notification={notification}
                    user={user!}
                    setNotifications={setNotifications}
                    isMobile={true}
                  />
                  {index < filteredNotifications.length - 1 && (
                    <Divider opacity={0.3} />
                  )}
                </Box>
              ))
            )}
          </VStack>
        </Box>
      </Container>
    );
  }

  // Desktop Layout
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 2fr 1fr" }}
      gap={6}
      p={containerPadding}
      w="100%"
      minH="100vh"
      // eslint-disable-next-line react-hooks/rules-of-hooks
      bg={useColorModeValue("gray.50", "gray.900")}
    >
      <GridItem>
        <Box display={{ base: "none", md: "block" }}>
          <LeftSidebar user={user} />
        </Box>
      </GridItem>

      <GridItem>
        <Box
          bg={useColorModeValue("white", "gray.800")}
          borderRadius="2xl"
          boxShadow="xl"
          overflow="hidden"
          border="1px solid"
          // eslint-disable-next-line react-hooks/rules-of-hooks
          borderColor={useColorModeValue("gray.100", "gray.700")}
        >
          <Box
            p={headerPadding}
            // eslint-disable-next-line react-hooks/rules-of-hooks
            bgGradient={useColorModeValue(
              "linear(to-r, #38A169, #68D391)", // light mode: green to light green
              "linear(to-r, #2F855A, #48BB78)" // dark mode: deep green to mint green
            )}
            color="white"
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <FaBell size={24} />
                <Heading size={headingSize}>Notifications</Heading>
                {unreadCount > 0 && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </HStack>

              <HStack spacing={2}>
                <DesktopFilters />
                {unreadCount > 0 && (
                  <IconButton
                    size={buttonSize}
                    aria-label="Mark all as read"
                    icon={<FaCheckDouble />}
                    colorScheme="whiteAlpha"
                    variant="outline"
                    onClick={markAllAsRead}
                  />
                )}
              </HStack>
            </Flex>
          </Box>

          <VStack
            spacing={0}
            align="stretch"
            maxH="calc(100vh - 200px)"
            overflowY="auto"
          >
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} p={cardPadding}>
                  <HStack spacing={4}>
                    <SkeletonCircle size="12" />
                    <Box flex="1">
                      <Skeleton height="20px" mb={2} />
                      <SkeletonText noOfLines={2} spacing="4" />
                    </Box>
                  </HStack>
                  {i < 4 && <Divider mt={4} />}
                </Box>
              ))
            ) : filteredNotifications.length === 0 ? (
              <Box p={12} textAlign="center">
                <FaBell size={48} color="gray" opacity={0.3} />
                <Text mt={4} fontSize="lg" color="gray.500" fontWeight="medium">
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </Text>
                <Text fontSize="sm" color="gray.400" mt={2}>
                  {filter === "unread"
                    ? "All caught up! 🎉"
                    : "New notifications will appear here"}
                </Text>
              </Box>
            ) : (
              filteredNotifications.map((notification, index) => (
                <Box key={`desktop-${notification.id}`}>
                  <NotificationItem
                    notification={notification}
                    user={user}
                    setNotifications={setNotifications}
                    isMobile={false}
                  />
                  {index < filteredNotifications.length - 1 && (
                    <Divider opacity={0.3} />
                  )}
                </Box>
              ))
            )}
          </VStack>
        </Box>
      </GridItem>

      <GridItem>
        <Box display={{ base: "none", md: "block" }}>
          <RightSidebar />
        </Box>
      </GridItem>
    </Grid>
  );
}

function NotificationItem({
  notification,
  user,
  setNotifications,
  isMobile = false,
}: {
  notification: Notification;
  user: User;
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  isMobile?: boolean;
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const avatarSize = isMobile ? "sm" : "md";
  const padding = isMobile ? 3 : 4;
  const iconSize = isMobile ? 16 : 20;

  const markNotificationAsRead = (notificationId: number) => {
    console.log("📨 Marking notification as read:", notificationId);
    request({
      endpoint: `/api/v1/notifications/${notificationId}`,
      method: "PUT",
      onSuccess: () => {
        console.log("✅ Notification marked as read:", notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      },
      onFailure: (error) =>
        console.error("❌ Failed to mark notification as read:", error),
    });
  };

  const handleNotificationClick = () => {
    console.log("🔔 Notification clicked:", notification);
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    navigate(`/posts/${notification.resourceId}`);
  };

  const getNotificationIcon = () => {
    if (notification.type === INotificationType.LIKE) {
      return <FaHeart color="#e53e3e" size={iconSize} />;
    }
    return <FaComment color="#3182ce" size={iconSize} />;
  };

  const getNotificationText = () => {
    const name = `${notification.sender?.firstName || "Someone"} ${
      notification.sender?.lastName || ""
    }`.trim();

    const fontSize = isMobile ? "sm" : "md";

    if (notification.recipient?.id === user?.id) {
      return (
        <Text fontSize={fontSize} lineHeight="1.4">
          <Text
            as="span"
            fontWeight="bold"
            color={useColorModeValue("gray.800", "white")}
          >
            {name}
          </Text>{" "}
          <Text as="span" color={useColorModeValue("gray.600", "gray.300")}>
            {notification.type === INotificationType.LIKE
              ? "liked"
              : "commented on"}{" "}
            your post
          </Text>
        </Text>
      );
    }

    return (
      <Text fontSize={fontSize} lineHeight="1.4">
        <Text
          as="span"
          fontWeight="bold"
          color={useColorModeValue("gray.800", "white")}
        >
          You
        </Text>{" "}
        <Text as="span" color={useColorModeValue("gray.600", "gray.300")}>
          {notification.type === INotificationType.LIKE
            ? "liked"
            : "commented on"}{" "}
          someone's post
        </Text>
      </Text>
    );
  };

  return (
    <Box
      p={padding}
      cursor="pointer"
      onClick={handleNotificationClick}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      transition="all 0.2s ease"
      bg={
        !notification.read
          ? useColorModeValue("blue.50", "blue.900/20")
          : isHovered && !isMobile
          ? useColorModeValue("gray.50", "gray.700")
          : "transparent"
      }
      position="relative"
      _active={
        isMobile
          ? {
              bg: useColorModeValue("gray.50", "gray.700"),
            }
          : {}
      }
      _hover={
        !isMobile
          ? {
              transform: "translateX(4px)",
            }
          : {}
      }
    >
      {!notification.read && (
        <Box
          position="absolute"
          left={0}
          top={0}
          bottom={0}
          width="3px"
          bgGradient="linear(to-b, blue.500, purple.500)"
          borderRadius="0 2px 2px 0"
        />
      )}

      <HStack spacing={isMobile ? 3 : 4} align="flex-start">
        <Box position="relative" flexShrink={0}>
          <Avatar
            size={avatarSize}
            src={
              notification.sender.profilePicture
                ? notification.sender.profilePicture.startsWith("http")
                  ? notification.sender.profilePicture
                  : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                      notification.sender.profilePicture
                    }`
                : "/avatar.svg"
            }
            name={`${notification.sender.firstName} ${notification.sender.lastName}`}
          />
          <Box
            position="absolute"
            bottom="-4px"
            right="-4px"
            bg={useColorModeValue("white", "gray.700")}
            borderRadius="full"
            p={1}
            border="2px solid"
            borderColor={useColorModeValue("white", "gray.700")}
            shadow="md"
          >
            <Box fontSize="12px">{getNotificationIcon()}</Box>
          </Box>
        </Box>

        <Box flex="1" minW={0}>
          <Box mb={1}>{getNotificationText()}</Box>

          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={isMobile ? 1 : 2}
            align={isMobile ? "flex-start" : "center"}
          >
            <TimeAgo date={notification.creationDate} />
            {notification.read && (
              <HStack spacing={1} color="green.500">
                <FaCheck size={10} />
                <Text fontSize="xs" fontWeight="medium">
                  Read
                </Text>
              </HStack>
            )}
          </Stack>
        </Box>

        <Box flexShrink={0}>
          {!notification.read && (
            <Box
              w={isMobile ? 2 : 3}
              h={isMobile ? 2 : 3}
              borderRadius="full"
              bg="blue.500"
              shadow="lg"
              animation="pulse 2s infinite"
            />
          )}
        </Box>
      </HStack>
    </Box>
  );
}

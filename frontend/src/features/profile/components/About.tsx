import {
  Box,
  Flex,
  IconButton,
  Input,
  Text,
  VStack,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
  Avatar,
  Button,
  HStack,
  Divider,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  EditIcon,
  CheckIcon,
  CloseIcon,
  AtSignIcon,
} from "@chakra-ui/icons";
import { FaBriefcase, FaMapMarkerAlt, FaUserEdit, FaUserFriends } from "react-icons/fa";
import { MdInfo } from "react-icons/md";
import { request } from "../../../utils/api";
import type { User } from "../../authentication/context/AuthenticationContextProvider";
import { useState, useEffect } from "react";
import { FcOk } from "react-icons/fc";
import { useParams } from "react-router-dom";
import { TbPoint } from "react-icons/tb";
import { Coins } from "lucide-react";

// Connection interfaces and enums
export enum Status {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
}

export interface IConnection {
  id: number;
  author: User;
  recipient: User;
  status: Status;
  connectionDate: string;
  seen: boolean;
}

interface AboutProps {
  user: User | null;
  authUser: User | null;
  onUpdate: (updatedUser: User) => void;
}

export function About({ user, authUser, onUpdate }: AboutProps) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [allConnections, setAllConnections] = useState<IConnection[]>([]);
  const toast = useToast();
  const params = useParams();

  // Get current user ID from path
  const currentUserId = params.userId || params.id;

  // Initialize profileData
  const [profileData, setProfileData] = useState({
    firstName: authUser?.firstName || "",
    lastName: authUser?.lastName || "",
    hobbies: authUser?.hobbies ? authUser.hobbies.join(", ") : "", // array → string
    nativeLanguage: authUser?.nativeLanguage || "",
    bio: authUser?.bio || "",
  });

  // Sync profileData when authUser changes
  useEffect(() => {
    if (authUser) {
      setProfileData({
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        hobbies: authUser.hobbies ? authUser.hobbies.join(", ") : "",
        nativeLanguage: authUser.nativeLanguage || "",
        bio: authUser.bio || "",
      });
    }
  }, [authUser]);

  // Fetch all connections
  useEffect(() => {
    if (authUser?.id) {
      console.log("🔄 [About] Fetching connections for authUser:", authUser.id);
      request<IConnection[]>({
        endpoint: "/api/v1/networking/connectionss",
        method: "GET",
        onSuccess: (data) => {
          console.log("✅ [About] Fetched connections:", data.length);
          setAllConnections(data);
        },
        onFailure: (error) => {
          console.error("❌ [About] Failed to fetch connections:", error);
          setAllConnections([]);
        },
      });
    }
  }, [authUser?.id]);

  // Find connection status
  const getConnectionStatus = () => {
    if (!authUser?.id || !currentUserId) return { status: 'none', connection: null };
    if (Number(authUser.id) === Number(currentUserId)) return { status: 'own_profile', connection: null };

    const connection = allConnections.find(conn => {
      const authId = Number(authUser.id);
      const currId = Number(currentUserId);
      return (
        (Number(conn.author.id) === authId && Number(conn.recipient.id) === currId) ||
        (Number(conn.author.id) === currId && Number(conn.recipient.id) === authId)
      );
    });

    if (!connection) return { status: 'none', connection: null };

    if (connection.status === Status.ACCEPTED) return { status: 'accepted', connection };
    if (connection.status === Status.PENDING) {
      return Number(connection.author.id) === Number(authUser.id)
        ? { status: 'pending_sent', connection }
        : { status: 'pending_received', connection };
    }

    return { status: 'none', connection: null };
  };

  const { status: connectionStatus, connection: currentConnection } = getConnectionStatus();

  // Mark received pending request as seen
  useEffect(() => {
    if (
      currentConnection &&
      currentConnection.status === Status.PENDING &&
      Number(currentConnection.recipient.id) === Number(authUser?.id) &&
      !currentConnection.seen
    ) {
      console.log("📝 [About] Marking connection as seen:", currentConnection.id);
      request<void>({
        endpoint: `/api/v1/networking/connections/${currentConnection.id}/seen`,
        method: "PUT",
        onSuccess: () => {
          console.log("✅ [About] Marked as seen");
          setAllConnections(prev =>
            prev.map(conn => (conn.id === currentConnection.id ? { ...conn, seen: true } : conn))
          );
        },
        onFailure: (err) => console.error("❌ [About] Failed to mark seen:", err),
      });
    }
  }, [currentConnection, authUser?.id]);

  // File preview
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const cancelEdit = () => {
    setEditingProfile(false);
    setProfileData({
      firstName: authUser?.firstName || "",
      lastName: authUser?.lastName || "",
      hobbies: authUser?.hobbies ? authUser.hobbies.join(", ") : "",
      nativeLanguage: authUser?.nativeLanguage || "",
      bio: authUser?.bio || "",
    });
  };

  const updateProfile = async () => {
    if (!user?.id) return;
    if (!profileData.firstName || !profileData.lastName) {
      toast({
        title: "Missing Info ❗",
        description: "First and Last name are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Convert hobbies string → array, then join with comma
    const hobbiesList = profileData.hobbies
      ? profileData.hobbies
          .split(",")
          .map(h => h.trim())
          .filter(h => h)
          .join(", ")
      : "";

    // Build query params using URLSearchParams (clean & safe)
    const params = new URLSearchParams();
    params.append("firstName", profileData.firstName);
    params.append("lastName", profileData.lastName);
    if (hobbiesList) params.append("hobbies", hobbiesList);
    if (profileData.nativeLanguage) params.append("nativeLanguage", profileData.nativeLanguage);
    if (profileData.bio) params.append("bio", profileData.bio);

    const endpoint = `/api/v1/authentication/profile/${user.id}/info?${params.toString()}`;

    console.log("📤 [About] Sending update:", Object.fromEntries(params));
    console.log("🔗 Request URL:", endpoint);

    try {
      await request<User>({
        endpoint,
        method: "PUT",
        // No body, no contentType — backend reads query params
        onSuccess: (data) => {
          console.log("✅ [About] Update successful:", data);
          onUpdate(data);
          setEditingProfile(false);
          toast({
            title: "Profile Updated 🎉",
            description: "Your profile was successfully updated.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        },
        onFailure: (error) => {
          console.error("❌ [About] Update failed:", error);
          toast({
            title: "Update Failed 😢",
            description: error?.message || "Check console for details",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        },
      });
    } catch (err: any) {
      console.error("🚨 [About] Unexpected error:", err);
      toast({
        title: "Unexpected Error 😵",
        description: err.message || "See console",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const uploadProfilePicture = async () => {
    if (!user?.id || !selectedFile) return;
    const formData = new FormData();
    formData.append("profilePicture", selectedFile);
    await request<User>({
      endpoint: `/api/v1/authentication/profile/${user.id}/profile-picture`,
      method: "PUT",
      body: formData,
      contentType: "multipart/form-data",
      onSuccess: (updatedUser) => {
        onUpdate(updatedUser);
        setSelectedFile(null);
        setPreviewUrl(null);
        toast({
          title: "Profile picture updated!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onFailure: () => {
        toast({
          title: "Upload failed 😢",
          description: "An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const sendConnectionRequest = () => {
    if (!currentUserId) return;
    request<IConnection>({
      endpoint: "/api/v1/networking/connections?recipientId=" + currentUserId,
      method: "POST",
      onSuccess: (newConn) => {
        setAllConnections(prev => [...prev, newConn]);
        toast({ title: "Connection request sent!", status: "success", duration: 3000 });
      },
      onFailure: () => {
        toast({ title: "Failed to send request", status: "error", duration: 3000 });
      },
    });
  };

  const acceptConnectionRequest = () => {
    if (!currentConnection) return;
    request<IConnection>({
      endpoint: `/api/v1/networking/connections/${currentConnection.id}`,
      method: "PUT",
      onSuccess: (updatedConn) => {
        setAllConnections(prev =>
          prev.map(c => (c.id === updatedConn.id ? updatedConn : c))
        );
        toast({ title: "Connection accepted!", status: "success", duration: 3000 });
      },
      onFailure: () => {
        toast({ title: "Failed to accept", status: "error", duration: 3000 });
      },
    });
  };

  const handlePendingRequestAction = () => {
    if (!currentConnection) return;
    request<void>({
      endpoint: `/api/v1/networking/connections/${currentConnection.id}`,
      method: "DELETE",
      onSuccess: () => {
        setAllConnections(prev => prev.filter(c => c.id !== currentConnection.id));
        const isAuthor = Number(currentConnection.author.id) === Number(authUser?.id);
        toast({
          title: isAuthor ? "Request Cancelled" : "Request Declined",
          status: "info",
          duration: 3000,
        });
      },
      onFailure: () => {
        toast({ title: "Action failed", status: "error", duration: 3000 });
      },
    });
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.profilePicture) {
      return user.profilePicture.startsWith('http')
        ? user.profilePicture
        : `${import.meta.env.VITE_API_URL}/api/v1/storage/${user.profilePicture}`;
    }
    return "/avatar.svg";
  };

  const renderConnectionButton = () => {
    switch (connectionStatus) {
      case 'own_profile': return null;
      case 'none':
        return (
          <Button size="sm" colorScheme="green" leftIcon={<FaUserFriends />} onClick={sendConnectionRequest}>
            Connect
          </Button>
        );
      case 'pending_sent':
        return (
          <Button size="sm" colorScheme="orange" onClick={handlePendingRequestAction}>
            Cancel Request
          </Button>
        );
      case 'pending_received':
        return (
          <VStack mt={6}>
            <Button size="sm" colorScheme="green" onClick={acceptConnectionRequest}>Accept</Button>
            <Button size="sm" colorScheme="red" variant="outline" onClick={handlePendingRequestAction}>Decline</Button>
          </VStack>
        );
      case 'accepted':
        return <Text color="green.500" fontWeight="medium"><FaUserFriends /></Text>;
      default: return null;
    }
  };

  return (
    <Box
      border="1px solid"
      borderRadius="xl"
      p={6}
      borderColor={useColorModeValue("gray.200", "gray.700")}
      bg={useColorModeValue("white", "gray.800")}
      boxShadow="lg"
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Box w="full">
          <VStack spacing={6} align="start">
            {/* Avatar */}
            <Box textAlign="center" w="full">
              <Box position="relative" display="inline-block">
                <Avatar
                  objectFit="cover"
                  size={useBreakpointValue({ base: "xl", md: "2xl" })}
                  src={getAvatarUrl()}
                  name={`${user?.firstName} ${user?.lastName}`}
                />
                {authUser?.id === user?.id && (
                  <Tooltip label="Edit Photo">
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      colorScheme="blue"
                      position="absolute"
                      bottom={1}
                      right={1}
                      borderRadius="full"
                      onClick={() => document.getElementById("fileUpload")?.click()}
                      aria-label="Edit Profile Picture"
                    />
                  </Tooltip>
                )}
              </Box>
              {authUser?.id === user?.id && (
                <VStack spacing={2} mt={4}>
                  <Input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    display="none"
                  />
                  {selectedFile && (
                    <HStack>
                      <Button leftIcon={<FcOk />} size="sm" colorScheme="blue" onClick={uploadProfilePicture}>
                        Upload Picture
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}>
                        Cancel
                      </Button>
                    </HStack>
                  )}
                </VStack>
              )}
            </Box>
            <Divider />
            {/* Profile Info */}
            {!editingProfile ? (
              <VStack align="start" spacing={4} w="full">
                <Flex justify="space-between" align="center" w="full">
                  <InfoItem
                    icon={<AtSignIcon />}
                    label="Name"
                    value={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  />
                  {renderConnectionButton()}
                </Flex>
                <InfoItem
                  icon={<FaBriefcase />}
                  label="Hobbies"
                  value={user?.hobbies?.length ? user.hobbies.join(", ") : "Not provided"}
                />
                <InfoItem
                  icon={<MdInfo />}
                  label="Bio"
                  value={user?.bio || "Not provided"}
                />
                <InfoItem
                  icon={<FaMapMarkerAlt />}
                  label="Native Language"
                  value={user?.nativeLanguage || "Not provided"}
                />
                <InfoItem
                  icon={<Coins />}
                  label="Points"
                  value={user?.points || 0}
                />
              </VStack>
            ) : (
              <VStack spacing={4} w="full">
                {["firstName", "lastName", "hobbies", "bio", "nativeLanguage"].map((field) => (
                  <FormControl key={field} isRequired={["firstName", "lastName"].includes(field)}>
                    <FormLabel fontSize="sm" textTransform="capitalize">
                      {field === "nativeLanguage" ? "Native Language" : field}
                    </FormLabel>
                    <Input
                      value={profileData[field as keyof typeof profileData]}
                      onChange={(e) => handleInputChange(field as keyof typeof profileData, e.target.value)}
                      placeholder={`Enter ${field === "nativeLanguage" ? "Native Language" : field}`}
                      variant="filled"
                    />
                  </FormControl>
                ))}
              </VStack>
            )}
          </VStack>
        </Box>
        {authUser?.id === user?.id && !editingProfile && (
          <Tooltip label="Edit Profile">
            <IconButton
              aria-label="Edit"
              icon={<FaUserEdit />}
              size="sm"
              onClick={() => setEditingProfile(true)}
            />
          </Tooltip>
        )}
        {authUser?.id === user?.id && editingProfile && (
          <HStack>
            <Tooltip label="Cancel">
              <IconButton aria-label="Cancel" icon={<CloseIcon />} size="sm" onClick={cancelEdit} />
            </Tooltip>
            <Tooltip label="Save Changes">
              <IconButton aria-label="Save" icon={<CheckIcon />} size="sm" colorScheme="teal" onClick={updateProfile} />
            </Tooltip>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <HStack align="center">
      <Box fontSize="lg" color="gray.500">{icon}</Box>
      <Box>
        <Text fontSize="sm" color="gray.500">{label}</Text>
        <Text fontWeight="medium">{value}</Text>
      </Box>
    </HStack>
  );
}
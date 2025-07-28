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

  const [profileData, setProfileData] = useState({
    firstName: authUser?.firstName || "",
    lastName: authUser?.lastName || "",
    profession: authUser?.profession || "",
    location: authUser?.location || "",
    bio: authUser?.bio || "",
  });

  // Fetch all connections for authenticated user (same as Invitation component)
  useEffect(() => {
    if (authUser?.id) {
      console.log("🔄 Fetching connections for authUser:", authUser.id);
      request<IConnection[]>({
        endpoint: "/api/v1/networking/connectionss",
        method: "GET",
        onSuccess: (data) => {
          console.log("✅ Fetched connections:", data.length);
          setAllConnections(data);
          console.log("🔍 All connections of loged user:", data.map(conn => conn.id).join(", "));
        },
        onFailure: (error) => {
          console.error("❌ Failed to fetch connections:", error);
          setAllConnections([]);
        },
      });
    }
  }, [authUser?.id]);

  // Find connection between authUser and currentUser
  const getConnectionStatus = () => {
    if (!authUser?.id || !currentUserId) {
      return { status: 'none', connection: null };
    }

    // If viewing own profile
    if (Number(authUser.id) === Number(currentUserId)) {
      return { status: 'own_profile', connection: null };
    }

    // Find connection between authUser and currentUser
    const connection = allConnections.find(conn => {
      const authUserIdNum = Number(authUser.id);
      const currentUserIdNum = Number(currentUserId);
      const authorId = Number(conn.author.id);
      const recipientId = Number(conn.recipient.id);

      return (
        (authorId === authUserIdNum && recipientId === currentUserIdNum) ||
        (authorId === currentUserIdNum && recipientId === authUserIdNum)
      );
    });

    if (!connection) {
      return { status: 'none', connection: null };
    }

    console.log("🔍 Found connection:", connection.id, "Status:", connection.status);

    if (connection.status === Status.ACCEPTED) {
      return { status: 'accepted', connection };
    }

    if (connection.status === Status.PENDING) {
      // Check who sent the request
      if (Number(connection.author.id) === Number(authUser.id)) {
        return { status: 'pending_sent', connection };
      } else {
        return { status: 'pending_received', connection };
      }
    }

    return { status: 'none', connection: null };
  };

  const { status: connectionStatus, connection: currentConnection } = getConnectionStatus();

  // Mark connection as seen if it's a received pending request
  useEffect(() => {
    if (currentConnection && 
        currentConnection.status === Status.PENDING &&
        Number(currentConnection.recipient.id) === Number(authUser?.id) &&
        !currentConnection.seen) {
      
      console.log("📝 Marking connection as seen:", currentConnection.id);
      request<void>({
        endpoint: `/api/v1/networking/connections/${currentConnection.id}/seen`,
        method: "PUT",
        onSuccess: () => {
          console.log("✅ Marked connection as seen");
          // Update local state
          setAllConnections(prev =>
            prev.map(conn =>
              conn.id === currentConnection.id ? { ...conn, seen: true } : conn
            )
          );
        },
        onFailure: (error) => console.error("❌ Error marking as seen:", error),
      });
    }
  }, [currentConnection, authUser?.id]);

  // Handle file preview
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
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
      profession: authUser?.profession || "",
      location: authUser?.location || "",
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

    try {
      await request<User>({
        endpoint: `/api/v1/authentication/profile/${user.id}/info?firstName=${encodeURIComponent(
          profileData.firstName
        )}&lastName=${encodeURIComponent(
          profileData.lastName
        )}&profession=${encodeURIComponent(
          profileData.profession
        )}&location=${encodeURIComponent(
          profileData.location
        )}&bio=${encodeURIComponent(profileData.bio)}`,
        method: "PUT",
        onSuccess: (data) => {
          onUpdate(data);
          setEditingProfile(false);
          toast({
            title: "Profile Updated 🎉",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        },
        onFailure: () => {
          toast({
            title: "Update Failed 😢",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        },
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Unexpected Error 😵",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  console.log(allConnections, "all connections from about component");
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
          description:"An error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const sendConnectionRequest = () => {
    if (!currentUserId) return;
    
    console.log("📤 Sending connection request to:", currentUserId);
    request<IConnection>({
      endpoint: "/api/v1/networking/connections?recipientId=" + currentUserId,
      method: "POST",
      onSuccess: (newConnection) => {
        console.log("✅ Connection request sent:", newConnection.id);
        setAllConnections(prev => [...prev, newConnection]);
        toast({
          title: "Connection request sent!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onFailure: (error) => {
        console.error("❌ Failed to send request:", error);
        toast({
          title: "Failed to send connection request",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const acceptConnectionRequest = () => {
    if (!currentConnection) return;
    
    console.log("✅ Accepting connection:", currentConnection.id);
    request<IConnection>({
      endpoint: `/api/v1/networking/connections/${currentConnection.id}`,
      method: "PUT",
      onSuccess: (updatedConnection) => {
        console.log("✅ Connection accepted:", updatedConnection.id);
        setAllConnections(prev =>
          prev.map(conn =>
            conn.id === updatedConnection.id ? updatedConnection : conn
          )
        );
        toast({
          title: "Connection request accepted!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      },
      onFailure: (error) => {
        console.error("❌ Failed to accept:", error);
        toast({
          title: "Failed to accept connection request",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const handlePendingRequestAction = () => {
    if (!currentConnection) return;
    
    console.log("🗑️ Handling pending request:", currentConnection.id);
    request<void>({
      endpoint: `/api/v1/networking/connections/${currentConnection.id}`,
      method: "DELETE",
      onSuccess: () => {
        console.log("✅ Connection removed:", currentConnection.id);
        setAllConnections(prev => prev.filter(conn => conn.id !== currentConnection.id));
        
        const isAuthor = Number(currentConnection.author.id) === Number(authUser?.id);
        toast({
          title: isAuthor ? "Request Cancelled" : "Request Declined",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      },
      onFailure: (error) => {
        console.error("❌ Failed to handle request:", error);
        toast({
          title: "Failed to process request",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      },
    });
  };

  const getAvatarUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.profilePicture) {
      if (user.profilePicture.startsWith('http')) {
        return user.profilePicture;
      }
      return `${import.meta.env.VITE_API_URL}/api/v1/storage/${user.profilePicture}`;
    }
    return "/avatar.svg";
  };

  const renderConnectionButton = () => {
    console.log("🎨 Rendering button for status:", connectionStatus);
    
    switch (connectionStatus) {
      case 'own_profile':
        return null;
      case 'none':
        return (
          <Button
            size="sm"
            colorScheme="green"
            leftIcon={<FaUserFriends />}
            onClick={sendConnectionRequest}
          >
            Connect
          </Button>
        );
      case 'pending_sent':
        return (
          <Button
            size="sm"
            colorScheme="orange"
            onClick={handlePendingRequestAction}
          >
            Cancel Request
          </Button>
        );
      case 'pending_received':
        return (
          <VStack marginTop={6} >
            <Button
              size="sm"
              colorScheme="green"
              onClick={acceptConnectionRequest}
            >
              Accept
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={handlePendingRequestAction}
            >
              Decline
            </Button>
          </VStack>
        );
      case 'accepted':
        return (
          <Text size="sm" color="green.500"  fontWeight="medium">
            <FaUserFriends/> 
          </Text>
        );
      default:
        return null;
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
            {/* Avatar & Upload */}
            <Box textAlign="center" w="full" position="relative">
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
                      <Button
                        leftIcon={<FcOk />}
                        size="sm"
                        colorScheme="blue"
                        onClick={uploadProfilePicture}
                      >
                        Upload Picture
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                      >
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
                <Flex justifyContent="space-between" alignItems="center" w="full">
                  <InfoItem
                    icon={<AtSignIcon />}
                    label="Name"
                    value={`${user?.firstName?.charAt(0).toUpperCase()}${user?.firstName?.slice(1) || ''} ${user?.lastName?.charAt(0).toUpperCase()}${user?.lastName?.slice(1) || ''}`}
                  />
                  {renderConnectionButton()}
                </Flex>
                
                <InfoItem
                  icon={<FaBriefcase />}
                  label="Profession"
                  value={user?.profession ? `${user.profession.charAt(0).toUpperCase()}${user.profession.slice(1)}` : "Not provided"}
                />
                <InfoItem
                  icon={<MdInfo />}
                  label="Bio"
                  value={user?.bio ? `${user.bio.charAt(0).toUpperCase()}${user.bio.slice(1)}` : "Not provided"}
                />
                <InfoItem
                  icon={<FaMapMarkerAlt />}
                  label="Location"
                  value={user?.location ? `${user.location.charAt(0).toUpperCase()}${user.location.slice(1)}` : "Not provided"}
                />
              </VStack>
            ) : (
              <VStack spacing={4} w="full">
                {["firstName", "lastName", "profession", "bio", "location"].map((field) => (
                  <FormControl
                    key={field}
                    isRequired={field === "firstName" || field === "lastName"}
                  >
                    <FormLabel fontSize="sm" textTransform="capitalize">
                      {field}
                    </FormLabel>
                    <Input
                      value={profileData[field as keyof typeof profileData]}
                      onChange={(e) =>
                        handleInputChange(field as keyof typeof profileData, e.target.value)
                      }
                      placeholder={`Enter ${field}`}
                      variant="filled"
                    />
                  </FormControl>
                ))}
              </VStack>
            )}
          </VStack>
        </Box>
        
        {authUser?.id === user?.id && (
          editingProfile ? (
            <HStack>
              <Tooltip label="Cancel">
                <IconButton
                  aria-label="Cancel"
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={cancelEdit}
                />
              </Tooltip>
              <Tooltip label="Save Changes">
                <IconButton
                  aria-label="Save"
                  icon={<CheckIcon />}
                  size="sm"
                  colorScheme="teal"
                  onClick={updateProfile}
                />
              </Tooltip>
            </HStack>
          ) : (
            <Tooltip label="Edit Profile">
              <IconButton
                aria-label="Edit"
                icon={<FaUserEdit />}
                size="sm"
                onClick={() => setEditingProfile(true)}
              />
            </Tooltip>
          )
        )}
      </Flex>
    </Box>
  );
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <HStack align="center">
      <Box fontSize="lg" color="gray.500">
        {icon}
      </Box>
      <Box>
        <Text fontSize="sm" color="gray.500">
          {label}
        </Text>
        <Text fontWeight="medium">{value}</Text>
      </Box>
    </HStack>
  );
}
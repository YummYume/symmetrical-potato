export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Iterable: { input: any; output: any };
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Creates a User. */
  createUser?: Maybe<CreateUserPayload>;
  /** Deletes a User. */
  deleteUser?: Maybe<DeleteUserPayload>;
  /** Logins a User. */
  loginUser?: Maybe<LoginUserPayload>;
  /** Updates a User. */
  updateUser?: Maybe<UpdateUserPayload>;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteUserArgs = {
  input: DeleteUserInput;
};

export type MutationLoginUserArgs = {
  input: LoginUserInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

/** A node, according to the Relay specification. */
export type Node = {
  /** The id of this node. */
  id: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  meUser?: Maybe<User>;
  node?: Maybe<Node>;
  user?: Maybe<UserItem>;
  users?: Maybe<UserCollectionCursorConnection>;
};

export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type User = Node & {
  __typename?: 'User';
  balance: Scalars['Float']['output'];
  email: Scalars['String']['output'];
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  roles: Scalars['Iterable']['output'];
  username: Scalars['String']['output'];
};

export type UserCollection = Node & {
  __typename?: 'UserCollection';
  allowedRoles: Scalars['Iterable']['output'];
  balance: Scalars['Float']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UserCollection>;
  email: Scalars['String']['output'];
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  mutuallyExclusiveRoles: Scalars['Iterable']['output'];
  /** The hashed password */
  password: Scalars['String']['output'];
  plainPassword: Scalars['String']['output'];
  roles: Scalars['Iterable']['output'];
  status: UserStatusEnum;
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UserCollection>;
  /** A visual identifier that represents this user. */
  userIdentifier: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

/** Cursor connection for UserCollection. */
export type UserCollectionCursorConnection = {
  __typename?: 'UserCollectionCursorConnection';
  edges?: Maybe<Array<Maybe<UserCollectionEdge>>>;
  pageInfo: UserCollectionPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Edge of UserCollection. */
export type UserCollectionEdge = {
  __typename?: 'UserCollectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<UserCollection>;
};

/** Information about the current page. */
export type UserCollectionPageInfo = {
  __typename?: 'UserCollectionPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type UserItem = Node & {
  __typename?: 'UserItem';
  id: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};

export enum UserLocaleEnum {
  En = 'En',
  Fr = 'Fr',
}

export enum UserStatusEnum {
  Dead = 'Dead',
  Unverified = 'Unverified',
  Verified = 'Verified',
}

/** Creates a User. */
export type CreateUserInput = {
  balance: Scalars['Float']['input'];
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: InputMaybe<Scalars['Float']['input']>;
  locale: UserLocaleEnum;
  /** The hashed password */
  password: Scalars['String']['input'];
  plainPassword: Scalars['String']['input'];
  roles: Scalars['Iterable']['input'];
  status: UserStatusEnum;
  token?: InputMaybe<Scalars['String']['input']>;
  tokenTtl?: InputMaybe<Scalars['Int']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  username: Scalars['String']['input'];
};

/** Creates a User. */
export type CreateUserNestedPayload = Node & {
  __typename?: 'createUserNestedPayload';
  allowedRoles: Scalars['Iterable']['output'];
  balance: Scalars['Float']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  email: Scalars['String']['output'];
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  mutuallyExclusiveRoles: Scalars['Iterable']['output'];
  /** The hashed password */
  password: Scalars['String']['output'];
  plainPassword: Scalars['String']['output'];
  roles: Scalars['Iterable']['output'];
  status: UserStatusEnum;
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  /** A visual identifier that represents this user. */
  userIdentifier: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

/** Creates a User. */
export type CreateUserPayload = {
  __typename?: 'createUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<CreateUserPayloadData>;
};

/** Creates a User. */
export type CreateUserPayloadData = Node & {
  __typename?: 'createUserPayloadData';
  allowedRoles: Scalars['Iterable']['output'];
  balance: Scalars['Float']['output'];
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<CreateUserNestedPayload>;
  email: Scalars['String']['output'];
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale: UserLocaleEnum;
  mutuallyExclusiveRoles: Scalars['Iterable']['output'];
  /** The hashed password */
  password: Scalars['String']['output'];
  plainPassword: Scalars['String']['output'];
  roles: Scalars['Iterable']['output'];
  status: UserStatusEnum;
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<CreateUserNestedPayload>;
  /** A visual identifier that represents this user. */
  userIdentifier: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

/** Deletes a User. */
export type DeleteUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

/** Deletes a User. */
export type DeleteUserPayload = {
  __typename?: 'deleteUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<DeleteUserPayloadData>;
};

/** Deletes a User. */
export type DeleteUserPayloadData = Node & {
  __typename?: 'deleteUserPayloadData';
  id: Scalars['ID']['output'];
};

/** Logins a User. */
export type LoginUserInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** The password of the user to authenticate. */
  password: Scalars['String']['input'];
  /** The username of the user to authenticate. */
  username: Scalars['String']['input'];
};

/** Logins a User. */
export type LoginUserPayload = {
  __typename?: 'loginUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<LoginUserPayloadData>;
};

/** Logins a User. */
export type LoginUserPayloadData = Node & {
  __typename?: 'loginUserPayloadData';
  id: Scalars['ID']['output'];
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
};

/** Updates a User. */
export type UpdateUserInput = {
  balance?: InputMaybe<Scalars['Float']['input']>;
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  createdAt?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  locale?: InputMaybe<UserLocaleEnum>;
  /** The hashed password */
  password?: InputMaybe<Scalars['String']['input']>;
  plainPassword?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Scalars['Iterable']['input']>;
  status?: InputMaybe<UserStatusEnum>;
  token?: InputMaybe<Scalars['String']['input']>;
  tokenTtl?: InputMaybe<Scalars['Int']['input']>;
  updatedAt?: InputMaybe<Scalars['String']['input']>;
  updatedBy?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

/** Updates a User. */
export type UpdateUserNestedPayload = Node & {
  __typename?: 'updateUserNestedPayload';
  allowedRoles?: Maybe<Scalars['Iterable']['output']>;
  balance?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  email?: Maybe<Scalars['String']['output']>;
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale?: Maybe<UserLocaleEnum>;
  mutuallyExclusiveRoles?: Maybe<Scalars['Iterable']['output']>;
  /** The hashed password */
  password?: Maybe<Scalars['String']['output']>;
  plainPassword?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Scalars['Iterable']['output']>;
  status?: Maybe<UserStatusEnum>;
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  /** A visual identifier that represents this user. */
  userIdentifier?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

/** Updates a User. */
export type UpdateUserPayload = {
  __typename?: 'updateUserPayload';
  clientMutationId?: Maybe<Scalars['String']['output']>;
  user?: Maybe<UpdateUserPayloadData>;
};

/** Updates a User. */
export type UpdateUserPayloadData = Node & {
  __typename?: 'updateUserPayloadData';
  allowedRoles?: Maybe<Scalars['Iterable']['output']>;
  balance?: Maybe<Scalars['Float']['output']>;
  createdAt?: Maybe<Scalars['String']['output']>;
  createdBy?: Maybe<UpdateUserNestedPayload>;
  email?: Maybe<Scalars['String']['output']>;
  /** WARNING: You should probably not use this method directly unless necessary. */
  globalRating?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  locale?: Maybe<UserLocaleEnum>;
  mutuallyExclusiveRoles?: Maybe<Scalars['Iterable']['output']>;
  /** The hashed password */
  password?: Maybe<Scalars['String']['output']>;
  plainPassword?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Scalars['Iterable']['output']>;
  status?: Maybe<UserStatusEnum>;
  token?: Maybe<Scalars['String']['output']>;
  tokenTtl?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  updatedBy?: Maybe<UpdateUserNestedPayload>;
  /** A visual identifier that represents this user. */
  userIdentifier?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

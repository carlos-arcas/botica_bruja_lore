interface NextFetchConfig {
  revalidate?: number;
}

interface RequestInit {
  next?: NextFetchConfig;
}
